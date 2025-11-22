import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function connectToMCP(serverUrl) {
  console.log(`Connecting to MCP HTTP server at ${serverUrl}...`);

  const transport = new StreamableHTTPClientTransport(serverUrl);
  await mcp.connect(transport);

  const [toolsResult] = await Promise.all([mcp.listTools()]);

  tools = toolsResult.tools || [];

  console.log(
    "Connected to MCP HTTP server with tools:",
    tools.map((t) => t.name)
  );
}

export async function callMCP(prompt) {
  const response = await client.responses.create({
    model: "llama-3.3-70b-versatile",
    input: prompt,
    tools: [
      {
        type: "mcp",
        server_label: "rizz-game",
        server_url: `${SERVER_URL}/mcp`,
        require_approval: "never",
      },
    ],
  });

  return response;
}
