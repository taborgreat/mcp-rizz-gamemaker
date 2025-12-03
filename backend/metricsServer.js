import express from 'express'
import client from 'prom-client'

const metricsApp = express();

client.collectDefaultMetrics();


export const totalWebsockets = new client.Gauge({
  name: "ws_connections_total",
  help: "Total active websocket connections"
});

export const totalConnectedEver = new client.Counter({
  name: "total_connected_ever",
  help: "Total active websocket connections"
});



// ------ PER ROOM METRICS ------


export const totalLLMCalls = new client.Counter({
  name: "llm_calls_total",
  help: "Total number of LLM calls made for girl thoughts per room",
  labelNames: ["roomId"]
});

export const llmTokensUsed = new client.Histogram({
  name: "llm_tokens_used",
  help: "Tokens used per LLM call per room",
  labelNames: ["roomId"],
  buckets: [50, 100, 200, 400, 800, 1200, 2000, 4000]
});

export const roomChats = new client.Counter({
  name: "room_chat_messages_total",
  help: "Total chat messages sent in a room",
  labelNames: ["roomId"]
});


export const roomPlayers = new client.Gauge({
  name: "room_players",
  help: "Players currently in a room",
  labelNames: ["roomId"]
});

export const roomRoundsPlayed = new client.Counter({
  name: "room_rounds_played",
  help: "Total rounds played per room",
  labelNames: ["roomId"]
});

export const roomGameWins = new client.Counter({
  name: "room_game_wins_total",
  help: "Total number of game wins per room",
  labelNames: ["roomId"]
});

export const roomResets = new client.Counter({
  name: "room_resets_total",
  help: "Total number of early game resets per room",
  labelNames: ["roomId"]
});

export const roomTurnsTotal = new client.Counter({
  name: "room_turns_total",
  help: "Total player turns attempted in a room",
  labelNames: ["roomId"]
});

export const roomTurnsMissed = new client.Counter({
  name: "room_turns_missed_total",
  help: "Total missed turns per room",
  labelNames: ["roomId"]
});

export const roomTurnsSuccess = new client.Counter({
  name: "room_turns_success_total",
  help: "Total successful player turns per room",
  labelNames: ["roomId"]
});


metricsApp.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

export function startMetricsServer(port = 9101) {
  metricsApp.listen(port, () => {
    console.log(`Metrics server running on :${port}`);
  });
}
