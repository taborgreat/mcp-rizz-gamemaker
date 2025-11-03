import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

const wss = new WebSocketServer({ server });

let girl = { x: 200, y: 200 };
const players = new Map(); // ws -> { name, posJoined }

//name = string of player name, max 12 characters

//posJoined = 1,2,3,4, ...
//determines placement of rendering in gamemaker
//if a lower player leaves, your posJoined automaticaly drops down
//max players in game is 4, min is 2. game ends if drops below 2. players spectate if join after 4.

function broadcast(msg) {
  for (const [ws] of players)
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

wss.on("connection", (ws) => {
  console.log("New player connected");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // First message is "join"
    if (data.type === "join") {
      players.set(ws, {
        name: data.name,
        //use function to setPos (based on all players in game) and then setPos
      });

      // send init state back to new player
      ws.send(
        JSON.stringify({
          action: "initState",
          params: {
            players: Array.from(players.values()),
            girl,
          },
        })
      );

      // announce to everyone
      broadcast({ action: "playerJoined", params: { name: data.name } });
    }

    // Player movement update (if someone leaves or joins)
    if (data.type === "move") {
      const p = players.get(ws);
      broadcast({
        action: "updatePlayers",
        params: { players: Array.from(players.values()) },
      });
    }

    // Girl moves toward one of the players
    if (data.type === "girlMoveTowards") {
      const target = players.get(ws);
      if (target) {
        // simple move step toward player
        girl.x += (target.x - girl.x) * 0.05;
        girl.y += (target.y - girl.y) * 0.05;
        broadcast({ action: "updateGirl", params: girl });
      }
    }
  });

  ws.on("close", () => {
    const left = players.get(ws);
    players.delete(ws);
    broadcast({ action: "playerLeft", params: { name: left?.name } });
  });
});

const PORT = 8082;
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
