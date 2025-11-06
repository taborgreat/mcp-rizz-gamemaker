import { WebSocketServer } from "ws";
import { GameStateManager } from "../core/gameStateManager.js";
import { GirlManager } from "../core/girlManager.js";
import { PlayerManager } from "../core/playerManager.js";
import { broadcast } from "../core/broadcaster.js";

export function startWebSocketServer(httpServer) {
  const MAXPLAYERSINROOM = 10;
  const wss = new WebSocketServer({ server: httpServer });

  console.log("💬 WebSocket server initialized with 10 game rooms.");

  // 🧩 Create 10 rooms
  const rooms = new Map();
  for (let i = 0; i < 10; i++) {
    const players = new PlayerManager();
    const girl = new GirlManager();
    const state = new GameStateManager(broadcast, girl, players, i);
    rooms.set(i, { players, girl, state });
  }

  // 🧩 Helper to find an open room
  const findAvailableRoom = () => {
    for (const [id, { players }] of rooms.entries()) {
      if (players.players.size < MAXPLAYERSINROOM) return id; // limit 4 players per room
    }
    return null; // all full
  };

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
          // --- determine room assignment ---
          let requestedRoom = data.gameRoomId;
          let assignedRoom = null;

          if (typeof requestedRoom === "number" && rooms.has(requestedRoom)) {
            const room = rooms.get(requestedRoom);
            if (room.players.players.size >= MAXPLAYERSINROOM) {
              // room full
              ws.send(
                JSON.stringify({
                  action: "roomFull",
                  gameRoomId: requestedRoom,
                })
              );
              return;
            }
            assignedRoom = requestedRoom;
          } else {
            // auto-assign to available room
            const openRoom = findAvailableRoom();
            if (openRoom === null) {
              ws.send(JSON.stringify({ action: "allRoomsFull" }));
              return;
            }
            assignedRoom = openRoom;
          }

          const { players, girl, state } = rooms.get(assignedRoom);
          const player = players.addPlayer(ws, data.name);
          player.gameRoomId = assignedRoom;

          console.log(`👥 ${player.name} joined room ${assignedRoom}`);

          // send initial world state
          ws.send(
            JSON.stringify({
              action: "playerJoined",
              params: { gameRoomId: player.gameRoomId, name: player.name },
            })
          );

          // notify others
          broadcast(players.players, {
            action: "playerJoinedForChat",
            params: { name: player.name },
          });

          ws.send(
            JSON.stringify({
              action: "worldUpdate",
              world: {
                gameState: state.state,
                players: players.getAllPlayers(assignedRoom),
                girl: girl.getState(),
              },
            })
          );

          // update world + maybe trigger countdown
          state.onPlayerJoined(player);
          break;
        }

        case "newMessage": {
          const player = getPlayerBySocket(ws);
          if (!player) return;

          const room = rooms.get(player.gameRoomId);
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
          const player = getPlayerBySocket(ws);
          if (!player) return;

          const room = rooms.get(player.gameRoomId);
          if (!room) return;

          player.latestMessage =
            data.text && data.text.trim() !== ""
              ? data.text
              : "Player missed their turn";
          console.log(
            `🎙️ [Room ${player.gameRoomId}] ${player.name} says: ${player.latestMessage}`
          );
          break;
        }

        case "girlMoveTowards": {
          const player = getPlayerBySocket(ws);
          if (!player) return;
          const room = rooms.get(player.gameRoomId);
          if (!room) return;
          const { girl, players } = room;
          girl.moveTowards(player, broadcast, players.players);
          break;
        }

        default:
          console.warn("Unknown message type:", data.type);
          console.log(msg);
      }
    });

    ws.on("close", () => {
      const player = getPlayerBySocket(ws);
      if (!player) return;

      const room = rooms.get(player.gameRoomId);
      if (!room) return;

      const { players, state } = room;

      broadcast(players.players, {
        action: "playerLeftForChat",
        params: { name: player.name },
      });

      players.removePlayer(ws);
      state.onPlayerLeft(player);

      state.broadcastWorld();
    });
  });

  // 🔍 Helper to find a player object by WebSocket reference
  function getPlayerBySocket(ws) {
    for (const { players } of rooms.values()) {
      const player = players.players.get(ws);
      if (player) return player;
    }
    return null;
  }
}
