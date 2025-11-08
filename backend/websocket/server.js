import { WebSocketServer } from "ws";
import { roomManager } from "../RoomManagerInstance.js";
import { broadcast } from "../core/broadcaster.js";

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

          // Validate the parsed shape
          const playerName =
            typeof parsed.name === "string" ? parsed.name.trim() : null;
          const gameRoomId =
            parsed.gameRoomId === null || typeof parsed.gameRoomId === "string"
              ? parsed.gameRoomId
              : null;

          if (!playerName) {
            console.warn("⚠️ Missing or invalid player name in join request");
            return;
          }

          roomManager.joinRoom(ws, sanitizeMessage(playerName), gameRoomId);
          break;
        }

        case "newMessage": {
          const player = roomManager.getPlayerBySocket(ws);
          if (!player) return;

          const room = roomManager.getRoom(player.gameRoomId);
          if (!room) return;

          const { players } = room;
          const MAX_CHAT_LENGTH = 120;
          let text = data.text?.trim() || "";
          if (!text) return;

          const now = Date.now();
          const spamWindow = 5000;
          const spamLimit = 3;

          if (!player._spam) player._spam = { count: 0, lastTime: 0 };

          if (now - player._spam.lastTime < spamWindow) {
            player._spam.count++;
          } else {
            player._spam.count = 1;
          }

          player._spam.lastTime = now;

          if (player._spam.count > spamLimit) {
            const kickNotice = {
              action: "chatMessage",
              from: "Server",
              text: `${player.name} was kicked for spam.`,
            };
            broadcast(players.players, kickNotice);
            try {
              ws.close();
            } catch (e) {}
            return;
          }

          if (text.length > MAX_CHAT_LENGTH) {
            const cutoff = text.lastIndexOf(" ", MAX_CHAT_LENGTH);
            text = text.slice(0, cutoff > 0 ? cutoff : MAX_CHAT_LENGTH) + "…";
          }
          let sanitized = sanitizeMessage(text);
          const chatData = {
            action: "chatMessage",
            from: player.name,
            text: sanitized,
          };
          broadcast(players.players, chatData);

          if (player._spam.count === spamLimit) {
            const warning = {
              action: "chatMessage",
              from: "Server",
              text: `${player.name} is sending messages too quickly.`,
            };
            broadcast(players.players, warning);
          }

          console.log(`💬 [Room ${player.gameRoomId}] ${player.name}: ${text}`);
          break;
        }

        case "player_inputting_turn": {
          const player = roomManager.getPlayerBySocket(ws);
          if (!player) return;
          const room = roomManager.getRoom(player.gameRoomId);
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
      roomManager.handlePlayerDisconnect(ws);
    });
  });
}
