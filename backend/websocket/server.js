import { normalizeStyle } from "../core/utils/utils.js";
import { totalWebsockets, roomChats } from "../metricsServer.js";

import { WebSocketServer } from "ws";
import { roomsInstance } from "../RoomsInstance.js";
import { broadcast } from "../core/Broadcaster.js";

import { sanitizeMessage, sanitizeHtmlOnly } from "../core/utils/utils.js";

// Per-IP tracking
const ipConnections = new Map(); // ip -> Set<ws>
const ipJoinTimestamps = new Map(); // ip -> [timestamps]
const MAX_CONNECTIONS_PER_IP = 20; // plenty for LAN party
const JOIN_RATE_WINDOW = 10000;
const JOIN_RATE_LIMIT = 5; // max 5 joins per 10s per IP

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function trackConnection(ip, ws) {
  if (!ipConnections.has(ip)) ipConnections.set(ip, new Set());
  ipConnections.get(ip).add(ws);
}

function untrackConnection(ip, ws) {
  const conns = ipConnections.get(ip);
  if (conns) {
    conns.delete(ws);
    if (conns.size === 0) ipConnections.delete(ip);
  }
}

function checkJoinRate(ip) {
  const now = Date.now();
  if (!ipJoinTimestamps.has(ip)) ipJoinTimestamps.set(ip, []);
  const timestamps = ipJoinTimestamps.get(ip);

  while (timestamps.length > 0 && now - timestamps[0] > JOIN_RATE_WINDOW) {
    timestamps.shift();
  }

  if (timestamps.length >= JOIN_RATE_LIMIT) return false;

  timestamps.push(now);
  return true;
}

export function startWebSocketServer(httpServer) {
  const wss = new WebSocketServer({
    server: httpServer,
    maxPayload: 64 * 1024,
    perMessageDeflate: false,
  });

  console.log("WebSocket server initialized");

  wss.on("connection", (ws, req) => {
    const ip = getIP(req);

    // Per-IP connection limit
    const existing = ipConnections.get(ip);
    if (existing && existing.size >= MAX_CONNECTIONS_PER_IP) {
      console.warn(`🚫 IP ${ip} exceeded max connections (${MAX_CONNECTIONS_PER_IP})`);
      ws.close(1008, "Too many connections");
      return;
    }

    trackConnection(ip, ws);
    ws._ip = ip;
    ws._hasJoined = false;

    console.log("👤 New WebSocket connection");
    totalWebsockets.inc();

    ws.on("message", (msg) => {
      let data;
      try {
        data = JSON.parse(msg);
      } catch {
        console.warn("⚠️ Invalid message JSON:", msg);
        return;
      }

      switch (data.type) {
        case "join": {
          // Prevent double-join on same socket
          if (ws._hasJoined) {
            console.warn("🚫 Socket already joined, ignoring duplicate join");
            return;
          }

          // Per-IP join rate limit
          if (!checkJoinRate(ip)) {
            console.warn(`🚫 IP ${ip} join rate limited`);
            ws.close(1008, "Too many join attempts");
            return;
          }

          let parsed = null;

          if (typeof data.name === "string") {
            try {
              parsed = JSON.parse(data.name);
            } catch (err) {
              console.warn("⚠️ Invalid join JSON string:", err);
              return;
            }
          } else {
            console.warn("⚠️ data.name was not a string:", data.name);
            return;
          }

          let playerName =
            typeof parsed.name === "string" ? parsed.name.trim() : null;
          const gameRoomId =
            parsed.gameRoomId === null || typeof parsed.gameRoomId === "string"
              ? parsed.gameRoomId
              : null;

          playerName = sanitizeMessage(playerName || "");
          if (!playerName.trim()) playerName = "Player";

          let style = parsed.playerStyle;

          if (typeof style === "string") {
            try {
              style = JSON.parse(style);
            } catch {
              style = null;
            }
          }

          const playerStyle = normalizeStyle(style);
          roomsInstance.joinRoom(ws, playerName, gameRoomId, playerStyle);
          ws._hasJoined = true;
          break;
        }

        case "newMessage": {
          const player = roomsInstance.getPlayerBySocket(ws);
          if (!player) return;

          const room = roomsInstance.getRoom(player.gameRoomId);
          if (!room) return;

          const { players } = room;
          const MAX_CHAT_LENGTH = 120;
          let text = data.text?.trim() || "";
          if (!text) return;

          const now = Date.now();
          const spamWindow = 3000;
          const spamLimit = 4;

          if (!player._spam) player._spam = { count: 0, lastTime: 0 };

          if (now - player._spam.lastTime < spamWindow) {
            player._spam.count++;
          } else {
            player._spam.count = 1;
          }
          roomChats.labels(player.gameRoomId).inc();

          player._spam.lastTime = now;

          if (player._spam.count > spamLimit) {
            const kickNotice = {
              action: "chatSystemMessage",
              params: {
                type: "kicked",
                text: `${player.name} was kicked for spam`,
              },
            };
            broadcast(players.players, kickNotice);
            try {
              ws.close(1000, "Kicked for spam");
            } catch (e) {}
            return;
          }

          if (text.length > MAX_CHAT_LENGTH) {
            const cutoff = text.lastIndexOf(" ", MAX_CHAT_LENGTH);
            text = text.slice(0, cutoff > 0 ? cutoff : MAX_CHAT_LENGTH) + "…";
          }
          let sanitized = sanitizeMessage(text);
          if (!sanitized.trim()) return;
          const chatData = {
            action: "chatMessage",
            from: player.name,
            text: sanitized,
          };
          broadcast(players.players, chatData);

          const remaining = spamLimit - player._spam.count;

          if (remaining <= 1 && remaining >= 0) {
            const warning = {
              action: "chatSystemMessage",
              params: {
                type: "warning",
                text:
                  remaining === 1 ? `Spam detected` : `Stop spamming please`,
              },
            };
            ws.send(JSON.stringify(warning));
          }

          console.log(`💬 [Room ${player.gameRoomId}] ${player.name}: ${text}`);
          break;
        }

        case "player_inputting_turn": {
          const player = roomsInstance.getPlayerBySocket(ws);
          if (!player) return;
          const room = roomsInstance.getRoom(player.gameRoomId);
          if (!room) return;

          // Block spectators from triggering LLM calls
          if (player.isSpectator) return;

          if (
            room.state.state !== "playersInputting" &&
            room.state.state !== "preparingPlayerSpeaking"
          ) {
            console.log(
              `🚫 [Room ${player.gameRoomId}] Ignored input from ${player.name} — not in input phase (${room.state.state})`
            );
            return;
          }

          const MAX_INPUT_LENGTH = 130;
          let text = data.text?.trim() || "";

          if (text.length > MAX_INPUT_LENGTH) {
            console.log("trimming", text);
            const cutoff = text.lastIndexOf(" ", MAX_INPUT_LENGTH);
            text =
              text.slice(0, cutoff > 0 ? cutoff : MAX_INPUT_LENGTH) + ". . .";
          }
          if (!text) text = "Player missed their turn";

          player.latestMessage = sanitizeHtmlOnly(text);

          console.log(
            `🎙️ [Room ${player.gameRoomId}] ${player.name}: ${player.latestMessage}`
          );

          room.state.onPlayerSubmitted(player);
          break;
        }

        default:
          console.warn("Unknown message type:", data.type);
      }
    });

    ws.on("close", () => {
      untrackConnection(ws._ip, ws);
      roomsInstance.handlePlayerDisconnect(ws);
      totalWebsockets.dec();
    });
  });
}
