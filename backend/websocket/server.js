import { normalizeStyle } from "../core/utils/utils.js";

import { WebSocketServer } from "ws";
import { roomsInstance } from "../RoomsInstance.js";
import { broadcast } from "../core/Broadcaster.js";

import { sanitizeMessage, sanitizeHtmlOnly } from "../core/utils/utils.js";

export function startWebSocketServer(httpServer) {
  const wss = new WebSocketServer({
    server: httpServer,
    maxPayload: 64 * 1024,
    perMessageDeflate: false,
  });

  console.log("💬 WebSocket server initialized");

  wss.on("connection", (ws) => {
    console.log("👤 New WebSocket connection");

    ws.on("message", (msg) => {
      let data;
      try {
        data = JSON.parse(msg);
      } catch {
        console.warn("⚠️ Invalid message JSON:", msg);
        return;
      }

      switch (data.type) {
        //butchered data here from front end side so jenk fix

        case "join": {
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
          break;
        }

        default:
          console.warn("Unknown message type:", data.type);
      }
    });

    ws.on("close", () => {
      roomsInstance.handlePlayerDisconnect(ws);
    });
  });
}
