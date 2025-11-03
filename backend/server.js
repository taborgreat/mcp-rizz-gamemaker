import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

let girl = { x: 200, y: 200 }; // shared girl position
const players = new Map(); // ws -> { name, x, y }

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
        x: Math.random() * 400,
        y: Math.random() * 400,
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

    // Player movement updates
    if (data.type === "move") {
      const p = players.get(ws);
      p.x = data.x;
      p.y = data.y;
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

console.log("Server running on ws://localhost:8080");
