import { WebSocketServer } from "ws";
import { GameStateManager } from "../core/gameStateManager.js";
import { GirlManager } from "../core/girlManager.js";
import { PlayerManager } from "../core/playerManager.js";
import { broadcast } from "../core/broadcaster.js";

export function startWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  const players = new PlayerManager();
  const girl = new GirlManager();
  const state = new GameStateManager(broadcast, girl, players);

  console.log("💬 WebSocket server initialized.");

  // Utility to gather full current world state
  const getWorldState = () => ({
    gameState: state.state,
    players: players.getAllPlayers(),
    girl: girl.getState(),
  });

  wss.on("connection", (ws) => {
    console.log("👤 New WebSocket connection");

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);

      switch (data.type) {
        case "join": {
          players.addPlayer(ws, data.name);

          // Send full init snapshot to the new player
          ws.send(
            JSON.stringify({ action: "worldUpdate", world: getWorldState() })
          );

          // Broadcast updated world to everyone
          broadcast(players.players, {
            action: "worldUpdate",
            world: getWorldState(),
          });

          // Check player count for game start
          state.onPlayerJoined();
          break;
        }

        case "girlMoveTowards": {
          const player = players.players.get(ws);
          if (player) girl.moveTowards(player, broadcast, players.players);
          break;
        }

        default:
          console.warn("⚠️ Unknown message type:", data.type);
      }
    });

    ws.on("close", () => {
      players.removePlayer(ws);
      state.onPlayerLeft();

      broadcast(players.players, {
        action: "worldUpdate",
        world: getWorldState(),
      });
    });
  });
}
