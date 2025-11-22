import express from "express";
import http from "http";
import cors from "cors";
import { startWebSocketServer } from "./websocket/server.js";
import { roomsInstance } from "./RoomsInstance.js";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const FRONTEND_URL = process.env.FRONTEND_URL;
const SERVER_URL = process.env.VITE_SERVER_URL;

const app = express();
const server = http.createServer(app);
const PORT = 8082;

app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST"],
  })
);

app.get("/roomsSummaries", (req, res) => {
  const rooms = roomsInstance.getRoomsSummaries();
  res.json({ rooms });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `HTTP server running on http://${SERVER_URL}. Port should be ${PORT}`
  );
});

startWebSocketServer(server);
