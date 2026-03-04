import { totalLLMCalls, llmTokensUsed } from "../metricsServer.js";

import OpenAI from "openai";
import { roomsInstance } from "../RoomsInstance.js";
import girlNamesData from "./utils/girlNames.json" with { type: "json" };
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const girlNames = girlNamesData.girlData;

const client = new OpenAI({
  baseURL: "http://10.0.0.23:11434/v1",
  apiKey: "ollama",
});
const MODEL = "goekdenizguelmez/JOSIEFIED-Qwen3:8b-q4_k_m";

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

const VALID_EMOTIONS = new Set(["ick", "disgusted", "flattered", "lovestruck", "neutral"]);

export function safeEmotion(emotion) {
  return VALID_EMOTIONS.has(emotion) ? emotion : "neutral";
}

export function full_turn({ roomId, playerResponses, decision }) {
  try {
    const room = roomsInstance.getRoom(roomId);
    if (!room) return JSON.stringify({ error: "Room not found" });

    for (const p of playerResponses) {
      const player = room.players.getPlayerByName(p.user);
      if (!player) continue;

      player.latestGirlMessage = p.response;
      player.latestGirlListeningEmotion = safeEmotion(p.listeningEmotion);
      player.latestGirlResponseEmotion = safeEmotion(p.responseEmotion);
    }

    decision.emotion = safeEmotion(decision.emotion);
    room.girl.movementDecision = decision;

    return JSON.stringify({ result: "success" });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

export async function runPlayerConversation(
  systemPrompt,
  chatHistory,
  playerMessage,
  roomId
) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: playerMessage },
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
  });

  try {
    const roomIdStr = String(roomId);
    totalLLMCalls.inc({ roomId: roomIdStr });
    if (response.usage?.total_tokens) {
      llmTokensUsed.observe({ roomId: roomIdStr }, response.usage.total_tokens);
    }
  } catch (err) {
    console.error("Metrics error:", err);
  }

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    const extracted = extractJSON(raw);
    if (extracted) return extracted;
    console.error("Failed to parse player conversation response:", raw);
    return {
      response: "...",
      listeningEmotion: "neutral",
      responseEmotion: "neutral",
    };
  }
}

export async function generateGirlIdentity() {
  const name = girlNames[Math.floor(Math.random() * girlNames.length)];

  // ask the model for a trait-based profile (adjectives, not nouns — avoids 8B fixation)
  const messages = [
    {
      role: "system",
      content: `Create a personality for a girl named ${name}.
Return JSON only:
{
  "personality": "one casual sentence describing her vibe",
  "traits": ["adjective1","adjective2","adjective3","adjective4","adjective5"],
  "conversationStyle": "one sentence about how she talks and flirts",
  "politicalLean": "left|right|neutral",
  "recentEvents": ["...", "..."],
  "familyFacts": ["...", "..."]
}
Rules:
- traits must be ADJECTIVES describing personality (e.g. sarcastic, flirty, blunt, loyal, curious). No nouns or hobbies.
- conversationStyle describes HOW she communicates (e.g. "teases hard but warms up if you're genuine")
- recentEvents and familyFacts can be empty arrays
`,
    },
    { role: "user", content: `Who is ${name}?` },
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  try {
    const parsed = JSON.parse(raw);
    return {
      name,
      personality: parsed.personality,
      traits: parsed.traits || [],
      conversationStyle: parsed.conversationStyle || "",
      politicalLean: parsed.politicalLean || "neutral",
      recentEvents: parsed.recentEvents || [],
      familyFacts: parsed.familyFacts || [],
    };
  } catch {
    const extracted = extractJSON(raw);
    if (extracted)
      return {
        name,
        personality: extracted.personality,
        traits: extracted.traits || [],
        conversationStyle: extracted.conversationStyle || "",
        politicalLean: extracted.politicalLean || "neutral",
        recentEvents: extracted.recentEvents || [],
        familyFacts: extracted.familyFacts || [],
      };
    console.error("Failed to parse girl personality response:", raw);
    return {
      name,
      personality: "Chill but confident, says whatever's on her mind.",
      traits: ["confident", "blunt", "playful", "impatient", "real"],
      conversationStyle: "Says what she thinks, no filter.",
      politicalLean: "neutral",
      recentEvents: [],
      familyFacts: [],
    };
  }
}

export async function runMovementDecision(
  systemPrompt,
  roundSummary,
  roomId
) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: roundSummary },
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
  });

  try {
    const roomIdStr = String(roomId);
    totalLLMCalls.inc({ roomId: roomIdStr });
    if (response.usage?.total_tokens) {
      llmTokensUsed.observe({ roomId: roomIdStr }, response.usage.total_tokens);
    }
  } catch (err) {
    console.error("Metrics error:", err);
  }

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    const extracted = extractJSON(raw);
    if (extracted) return extracted;
    console.error("Failed to parse movement decision response:", raw);
    return { destination: "stay", reason: "...", emotion: "neutral" };
  }
}

// analyze the recent round summary and pull out any important player facts
export async function extractRoundFacts(roundSummary, roomId, existingFacts = []) {
  let systemPrompt = `You are an analyzer that reads a group chat exchange between an AI girl and several players.\nFor each player message in the summary, if there is an *important* detail (a preference, hobby, personal tidbit etc.), output it as a fact in the format \"PlayerName: fact\".  Only include facts about the users (ignore anything the girl says).`;
  if (existingFacts && existingFacts.length) {
    systemPrompt += ` Do NOT repeat any fact already known: ${existingFacts.join(", ")}.
`;
  }
  systemPrompt += ` Respond with JSON only: {"facts":["Player1: ...","Player2: ..."]}.  If there are no important new facts, return {"facts":[]}.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: roundSummary },
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
  });

  try {
    const roomIdStr = String(roomId);
    totalLLMCalls.inc({ roomId: roomIdStr });
    if (response.usage?.total_tokens) {
      llmTokensUsed.observe({ roomId: roomIdStr }, response.usage.total_tokens);
    }
  } catch (err) {
    console.error("Metrics error:", err);
  }

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    const extracted = extractJSON(raw);
    if (extracted) return extracted;
    console.error("Failed to parse round facts response:", raw);
    return { facts: [] };
  }
}
