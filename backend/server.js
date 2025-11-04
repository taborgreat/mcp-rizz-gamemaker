import http from "http";
import { startWebSocketServer } from "./websocket/server.js";

const PORT = 8082;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("HTTP server running — WebSocket also attached.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP server running at http://LAN:${PORT}`);
});

startWebSocketServer(server);
