import Groq from "groq-sdk";
import { roomsInstance } from "../RoomsInstance.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";

//tool

function full_turn({ roomId, playerResponses, decision }) {
  try {
    const room = roomsInstance.getRoom(roomId);
    if (!room) return JSON.stringify({ error: "Room not found" });

    for (const p of playerResponses) {
      const player = room.players.getPlayerByName(p.user);
      if (!player) continue;

      player.latestGirlMessage = p.response;
      player.latestGirlListeningEmotion = p.listeningEmotion;
      player.latestGirlResponseEmotion = p.responseEmotion;
    }

    room.girl.movementDecision = decision;

    return JSON.stringify({ result: "success" });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

const availableFunctions = { full_turn };

const tools = [
  {
    type: "function",
    function: {
      name: "full_turn",
      description:
        "Handles ALL player responses AND the girl's movement decision in ONE CALL.",
      parameters: {
        type: "object",
        properties: {
          roomId: { type: "number" },
          playerResponses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                user: { type: "string" },
                response: { type: "string" },
                listeningEmotion: { type: "string" },
                responseEmotion: { type: "string" },
              },
              required: [
                "user",
                "response",
                "listeningEmotion",
                "responseEmotion",
              ],
            },
          },
          decision: {
            type: "object",
            properties: {
              destination: { type: "string" },
              reason: { type: "string" },
              emotion: { type: "string" },
            },
            required: ["destination", "reason", "emotion"],
          },
        },
        required: ["roomId", "playerResponses", "decision"],
      },
    },
  },
];

export async function runRizzGameAI(userPrompt) {
  const messages = [
    {
      role: "system",
      content: `
You are the girl on the stage surrounded by people trying to gain your attention.

You MUST output ONLY ONE TOOL CALL:
  full_turn({ roomId, playerResponses, decision })

Where:
- playerResponses = array of 1–4 player responses (one for each player speaking to you)
  Each entry contains:
    - user → the player's name.
    - response → what you (the girl) say back to that player.
    - listeningEmotion → the emotion you feel **while listening** to that player's message.
    - responseEmotion → the emotion you feel **while responding** to that player. The emotion to accompany your response.
-Try to generate unique emotions for each one unless absolutely doesn't make sense.


- decision = final movement choice for this turn
    - destination → (a user, "stay", or "center"). Usually towards a user unless something bad happens. Center is when you want to retreat.
    - reason → why you are choosing the direction (spoken as the girl in character to the players)
    - emotion → the emotion you feel about the movement.


ABSOLUTELY NO TEXT OUTPUT. ONLY THE TOOL CALL.
      `.trim(),
    },
    { role: "user", content: userPrompt },
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    tools,
    tool_choice: { type: "function", function: { name: "full_turn" } },
  });

  const message = response.choices[0].message;

  if (!message.tool_calls || message.tool_calls.length === 0) {
    return {
      error: "AI did not call full_turn tool",
      raw: message,
    };
  }

  const call = message.tool_calls[0];
  const fn = availableFunctions[call.function.name];

  let args = {};
  try {
    args = JSON.parse(call.function.arguments);
    console.log("📤 Parsed tool args:", args);
  } catch (e) {
    return { error: "Invalid JSON from model", raw: call.function.arguments };
  }

  const toolResult = await fn(args);

  return {
    result: toolResult,
    toolCall: call,
  };
}
