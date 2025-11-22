import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { roomsInstance } from "../RoomsInstance.js";

// Create and configure the MCP server
function getMcpServer() {
  const server = new McpServer({ name: "rizz-game", version: "1.0.0" });

  server.tool(
    "player_response",
    "Respond to a specific player's message",
    {
      roomId: { type: "number" },
      user: { type: "string" },
      response: { type: "string" },
      listeningEmotion: { type: "string" },
      responseEmotion: { type: "string" },
    },
    async (args) => {
      const room = roomsInstance.getRoom(args.roomId);
      if (!room) throw new Error("Room not found");

      const player = room.players.getPlayerByName(args.user);
      if (!player) throw new Error("Player not found");

      player.latestGirlMessage = args.response;
      player.latestGirlListeningEmotion = args.listeningEmotion;
      player.latestGirlResponseEmotion = args.responseEmotion;

      return ok();
    }
  );

  server.tool(
    "turn_decision_response",
    "Decide where the girl should walk",
    {
      roomId: { type: "number" },
      destination: { type: "string" },
      reason: { type: "string" },
      emotion: { type: "string" },
    },
    async (args) => {
      const room = roomsInstance.getRoom(args.roomId);
      if (!room) throw new Error("Room not found");

      const girl = room.girl;

      girl.movementDecision = {
        destination: args.destination,
        reason: args.reason,
        emotion: args.emotion,
      };

      return ok();
    }
  );

  return server;
}

export async function handleMcpRequest(req, res) {
  try {
    const server = getMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[MCP] Error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603 },
        id: req.body.id || null,
      });
    }
  }
}
