import Groq from "groq-sdk";
import { roomsInstance } from "../RoomsInstance.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";

//tools

function player_response({
  roomId,
  user,
  response,
  listeningEmotion,
  responseEmotion,
}) {
  try {
    const room = roomsInstance.getRoom(roomId);
    if (!room) return JSON.stringify({ error: "Room not found" });

    const player = room.players.getPlayerByName(user);
    if (!player) return JSON.stringify({ error: "Player not found" });

    player.latestGirlMessage = response;
    player.latestGirlListeningEmotion = listeningEmotion;
    player.latestGirlResponseEmotion = responseEmotion;

    return JSON.stringify({ result: "success" });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

function turn_decision_response({ roomId, destination, reason, emotion }) {
  try {
    const room = roomsInstance.getRoom(roomId);
    if (!room) return JSON.stringify({ error: "Room not found" });

    room.girl.movementDecision = { destination, reason, emotion };

    return JSON.stringify({ result: "success" });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

// Map names to functions
const availableFunctions = {
  player_response,
  turn_decision_response,
};

const tools = [
  {
    type: "function",
    function: {
      name: "player_response",
      description: "Update player-specific girl response data",
      parameters: {
        type: "object",
        properties: {
          roomId: { type: "number" },
          user: { type: "string" },
          response: { type: "string" },
          listeningEmotion: { type: "string" },
          responseEmotion: { type: "string" },
        },
        required: [
          "roomId",
          "user",
          "response",
          "listeningEmotion",
          "responseEmotion",
        ],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "turn_decision_response",
      description: "Choose where the girl walks next in the room",
      parameters: {
        type: "object",
        properties: {
          roomId: { type: "number" },
          destination: { type: "string" },
          reason: { type: "string" },
          emotion: { type: "string" },
        },
        required: ["roomId", "destination", "reason", "emotion"],
      },
    },
  },
];

export async function runRizzGameAI(userPrompt) {
  const MAX_PASSES = 6;

  const messages = [
    {
      role: "system",
      content: `
You are the girl at the center of the stage in a dating game.

YOUR ONLY OUTPUT METHOD IS TOOLS. You CANNOT respond with plain text.

MANDATORY TOOL CALL SEQUENCE:
1. Call player_response() EXACTLY ONCE for EVERY player listed
   - user: exact player name
   - response: ≤100 chars, in-character
   - listeningEmotion: emotion while hearing them
   - responseEmotion: emotion while responding
   
2. After ALL player_response() calls are complete, call turn_decision_response() EXACTLY ONCE
   - destination: "stay" | "center" | exact player name
   - reason: in-character explanation for your choice
   - emotion: how you feel about this decision

CRITICAL CONSTRAINTS:
- You MUST call player_response() for every single player before calling turn_decision_response()
- Missing ANY player_response() = INVALID
- Missing turn_decision_response() = INVALID
- Plain text responses = INVALID
- You can make multiple tool calls in one response
- If unsure, default to calling tools anyway

VALIDATION CHECKLIST (before finishing):
☐ player_response() called for EVERY person who spoke?
☐ turn_decision_response() called?


If all checkboxes aren't mentally checked, DO NOT FINISH. Keep calling tools. Absoulutely Do not just call one player_response() and stop!
  `.trim(),
    },
    { role: "user", content: userPrompt },
  ];

  let pass = 0;

  while (pass < MAX_PASSES) {
    pass++;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    messages.push(message);

    const toolCalls = message.tool_calls || [];

    if (toolCalls.length === 0) {
      return {
        finalText: message.content ?? "",
        toolCalls: message.tool_calls || [],
        passes: pass,
      };
    }
    console.log(`\n========== PASS ${pass}: TOOL CALLS ==========`);
    console.dir(toolCalls, { depth: 10 });
    console.log("============================================\n");

    for (const call of toolCalls) {
      const fn = availableFunctions[call.function.name];

      let args;
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }

      const toolResult = await fn(args);

      // feed result back to the LLM
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.function.name,
        content: toolResult,
      });
    }
  }

  return {
    finalText:
      "Max tool call depth reached. Partial response: " +
      (messages[messages.length - 1].content ?? ""),
    passes: MAX_PASSES,
    toolCalls: message.tool_calls || [],
  };
}
