import { WebSocketServer } from "ws";
import { roomManager } from "../RoomManagerInstance.js";
import { broadcast } from "../core/broadcaster.js";

export function startWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

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
        case "join": {
          //butchered data here from front end side so jenk fix
          let parsed;
          try {
            parsed = JSON.parse(data.name);
          } catch (err) {
            console.warn("⚠️ Failed to parse name field:", err);
            return;
          }

          const playerName = parsed.name;
          const gameRoomId = parsed.gameRoomId;

          roomManager.joinRoom(ws, playerName, gameRoomId);
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

          if (text.length > MAX_CHAT_LENGTH) {
            const cutoff = text.lastIndexOf(" ", MAX_CHAT_LENGTH);
            text = text.slice(0, cutoff > 0 ? cutoff : MAX_CHAT_LENGTH) + "…";
          }

          const chatData = {
            action: "chatMessage",
            from: player.name,
            text,
          };

          console.log(`💬 [Room ${player.gameRoomId}] ${player.name}: ${text}`);

          broadcast(players.players, chatData);
          break;
        }

        case "player_inputting_turn": {
          const player = roomManager.getPlayerBySocket(ws);
          if (!player) return;
          const room = roomManager.getRoom(player.gameRoomId);
          if (!room) return;

          const MAX_INPUT_LENGTH = 130;
          let text = data.text?.trim() || "";

          // Limit to 150 chars (cut at nearest space if possible)
          if (text.length > MAX_INPUT_LENGTH) {
            console.log("trimming", text);
            const cutoff = text.lastIndexOf(" ", MAX_INPUT_LENGTH);
            text =
              text.slice(0, cutoff > 0 ? cutoff : MAX_INPUT_LENGTH) + ". . .";
          }
          if (!text) text = "Player missed their turn";

          player.latestMessage = text;

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
