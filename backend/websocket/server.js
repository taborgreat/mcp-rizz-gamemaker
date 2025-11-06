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
          const player = players.addPlayer(ws, data.name);

          ws.send(
            JSON.stringify({ action: "worldUpdate", world: getWorldState() })
          );

          ws.send(
            JSON.stringify({
              action: "playerJoined",
              params: { name: player.name },
            })
          );

          broadcast(
            players.players,
            {
              action: "playerJoinedForChat",
              params: { name: player.name },
            },
            ws
          );

          broadcast(players.players, {
            action: "worldUpdate",
            world: getWorldState(),
          });

          // Check player count for game start
          state.onPlayerJoined();
          break;
        }

        case "newMessage": {
          const player = players.players.get(ws);
          if (!player) return console.warn("Chat from unknown player");

          const chatData = {
            action: "chatMessage",
            from: player.name,
            text: data.text,
          };

          console.log(`💬 ${player.name}: ${data.text}`);

          broadcast(players.players, chatData);
          break;
        }

        case "player_inputting_turn": {
          const player = players.players.get(ws);
          if (player) {
            player.latestMessage =
              data.text && data.text.trim() !== ""
                ? data.text
                : "Player missed their turn";
            console.log(`${player.name} says: ${player.latestMessage}`);
          } else {
            console.warn("Received input from unknown player");
          }
          break;
        }

        case "girlMoveTowards": {
          const player = players.players.get(ws);
          if (player) girl.moveTowards(player, broadcast, players.players);
          break;
        }

        default:
          console.warn("Unknown message type:", data.type);
          console.log(msg);
      }
    });

    ws.on("close", () => {
      const player = players.players.get(ws);
      if (player) {
        broadcast(players.players, {
          action: "playerLeftForChat",
          params: { name: player.name },
        });
      }
      players.removePlayer(ws);
      state.onPlayerLeft();
      broadcast(players.players, {
        action: "worldUpdate",
        world: getWorldState(),
      });
    });
  });
}
