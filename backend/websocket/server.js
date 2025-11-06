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
          const chatData = {
            action: "chatMessage",
            from: player.name,
            text: data.text,
          };
          console.log(
            `💬 [Room ${player.gameRoomId}] ${player.name}: ${data.text}`
          );
          broadcast(players.players, chatData);
          break;
        }

        case "player_inputting_turn": {
          const player = roomManager.getPlayerBySocket(ws);
          if (!player) return;
          const room = roomManager.getRoom(player.gameRoomId);
          if (!room) return;
          player.latestMessage =
            data.text?.trim() !== "" ? data.text : "Player missed their turn";
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
