import express from "express";
import http from "http";
import cors from "cors";
import { startWebSocketServer } from "./websocket/server.js";
import { roomsInstance } from "./RoomsInstance.js";

const app = express();
const server = http.createServer(app);
const PORT = 8082;

app.use(
  cors({
    origin: ["https://rizz.tabors.site:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
  })
);

app.get("/roomsSummaries", (req, res) => {
  const rooms = roomsInstance.getRoomsSummaries();
  res.json({ rooms });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP server running on http://LAN:${PORT}`);
});

startWebSocketServer(server);
