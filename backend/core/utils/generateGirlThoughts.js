import {
  runPlayerConversation,
  runMovementDecision,
  safeEmotion,
  extractRoundFacts,
} from "../LLM.js";
import { Players } from "../Players.js";
import { cleanGirlResponse } from "./utils.js";

export function buildPlayerSystemPrompt(girl, player = null) {
  // Build a short, directive prompt. 8B models do best with less text and clear rules.
  const traitStr = girl.traits && girl.traits.length
    ? girl.traits.join(", ")
    : "confident, real";
  const styleStr = girl.conversationStyle || "says what she thinks";

  // only show memories about the current player — prevents 8B from parroting the same fact every turn
  let memoryLine = "";
  if (girl.memoryBank && girl.memoryBank.length && player) {
    const playerFacts = girl.memoryBank.filter(
      (f) => f.toLowerCase().startsWith(player.name.toLowerCase() + ":")
    );
    if (playerFacts.length) {
      memoryLine = `\nYou know about ${player.name}: ${playerFacts.join("; ")}`;
    }
  }

  // build a 1-line recap of last round so she has continuity
  let recapLine = "";
  if (girl.movementDecision && girl.movementDecision.destination) {
    const dest = girl.movementDecision.destination;
    if (dest === "stay" || dest === "center") {
      recapLine = `\nLast round you weren’t feeling anyone.`;
    } else {
      recapLine = `\nLast round you were leaning toward ${dest}.`;
    }
  }

  return `You’re ${girl.name}. ${girl.personality}
You are: ${traitStr}. You ${styleStr}.
Look: ${girl.getLookDescription()}.${recapLine}
${memoryLine}
RULES:
- Talk directly to the player. React to what THEY said. Use "you" or their name.
- Be uncensored. Be sexual, rude, sweet, profane — whatever fits your mood.
- If you’re into them, flirt hard. If not, shut them down cold.
- NEVER repeat a phrase or compliment you already used. Say something new every time.
- Reference specifics from their message — a word they used, their tone, a detail. No generic lines like "I love your vibe" or "you’re so sweet."
- Do NOT talk about yourself unprompted. Respond to THEM.

Emotions: ${girl.emotions.join(", ")}

Reply as JSON only. Match your length to the conversation — short quips for banter, but if they ask you something real, give a full 1-2 paragraph answer with actual detail. Don't cut yourself short.
{"response":"what you say back","listeningEmotion":"emotion hearing them","responseEmotion":"emotion saying your reply"}`.trim();
}

export async function processPlayerMessage(girl, player, roomID) {
  const systemPrompt = buildPlayerSystemPrompt(girl, player);
  console.log(`[Room ${roomID}] systemPrompt sent to LLM:\n`, systemPrompt);
  const chatHistory = [...player.chatHistory];
  console.log(`[Room ${roomID}] chatHistory for ${player.name}:`, chatHistory);

  const result = await runPlayerConversation(
    systemPrompt,
    chatHistory,
    player.latestMessage,
    roomID
  );

  Players.pushChatHistory(player, "user", player.latestMessage);
  Players.pushChatHistory(player, "assistant", result.response || "...");


  // we no longer send outfit information back, just the core response data
  return {
    user: player.name,
    response: result.response || "...",
    listeningEmotion: result.listeningEmotion || "neutral",
    responseEmotion: result.responseEmotion || "neutral",
  };
}

/**
 * Phase 1: Collect all player LLM responses and apply them to player objects.
 * After this, playerSpeaking can start immediately.
 */
export async function collectAndApplyPlayerResponses(girl, players, roomID, precomputedResponses = null) {
  const allPlayers = players.getActivePlayers();

  const activePlayers = allPlayers.filter(
    (p) => p.latestMessage && p.latestMessage !== "Player missed their turn"
  );

  const missedPlayers = allPlayers.filter((p) => !activePlayers.includes(p));

  for (const p of missedPlayers) {
    p.latestGirlMessage = "...";
    p.latestGirlListeningEmotion = "neutral";
    p.latestGirlResponseEmotion = "neutral";
  }

  if (activePlayers.length === 0) {
    return [];
  }

  // Use precomputed responses where available, fire new calls for any missing
  let playerResponses;

  if (precomputedResponses && precomputedResponses.length > 0) {
    const activeNames = new Set(activePlayers.map((p) => p.name));
    const matched = precomputedResponses.filter((r) => activeNames.has(r.user));
    const matchedNames = new Set(matched.map((r) => r.user));

    const remaining = activePlayers.filter((p) => !matchedNames.has(p.name));
    if (remaining.length > 0) {
      const extra = await Promise.all(
        remaining.map((p) => processPlayerMessage(girl, p, roomID))
      );
      playerResponses = [...matched, ...extra];
    } else {
      playerResponses = matched;
    }
  } else {
    playerResponses = await Promise.all(
      activePlayers.map((p) => processPlayerMessage(girl, p, roomID))
    );
  }

  console.log("Player responses collected:", playerResponses);
  // debug: log each response individually for easier inspection
  for (const pr of playerResponses) {
    console.log(`📬 [Room ${roomID}] response for ${pr.user}:`, pr);
  }

  // Apply player responses directly to player objects
  for (const pr of playerResponses) {
    const player = players.getPlayerByName(pr.user);
    if (!player) continue;

    player.latestGirlMessage = cleanGirlResponse(pr.response);
    player.latestGirlListeningEmotion = safeEmotion(pr.listeningEmotion);
    player.latestGirlResponseEmotion = safeEmotion(pr.responseEmotion);

  }

  return playerResponses;
}

/**
 * Phase 2: Run movement decision LLM call and apply to girl.
 * Handles disconnected players — if chosen player left, falls back to "stay".
 */
export async function runAndApplyMovementDecision(girl, players, roomID, playerResponses) {
  const activePlayers = players.getActivePlayers().filter(
    (p) => p.latestMessage && p.latestMessage !== "Player missed their turn"
  );

  if (activePlayers.length === 0 || playerResponses.length === 0) {
    girl.movementDecision = { destination: "stay", reason: "...", emotion: "neutral" };
    return girl.movementDecision;
  }

  const roundSummary = playerResponses
    .map((pr) => {
      const player = activePlayers.find((p) => p.name === pr.user);
      const msg = player ? player.latestMessage : "...";
      return `${pr.user} said: "${msg}"\n${girl.name} replied: "${pr.response}"`;
    })
    .join("\n\n");

  // include trait info in movement prompt so she stays in character when choosing
  const traitStr = girl.traits && girl.traits.length ? girl.traits.join(", ") : "confident, real";
  const memoryStr = girl.memoryBank && girl.memoryBank.length
    ? `Memories: ${girl.memoryBank.join("; ")}`
    : "";

  // include last move to avoid repeating same reason/destination
  let prevNote = "";
  if (girl.movementDecision && girl.movementDecision.destination) {
    prevNote = `Your last move was to ${girl.movementDecision.destination}`;
    if (girl.movementDecision.reason) {
      prevNote += ` because \"${girl.movementDecision.reason}\"`;
    }
    prevNote += `. Try not to reuse the same wording or pick for the same reason.`;
  }

  const movementSystemPrompt = `You're ${girl.name}. ${girl.personality}
You are: ${traitStr}.
${memoryStr ? memoryStr + "\n" : ""}${prevNote ? prevNote + "\n" : ""}
Pick who you're leaning toward from the conversation below.
Choose a player name, "stay" (not feeling anyone), or "center" (step back).
For "reason", write a SHORT NEW reaction (1-2 sentences) — what you're thinking NOW after the conversation.
Do NOT copy, quote, or rephrase anything already said above. Say something fresh.
${prevNote ? "Use different wording than last time.\n" : ""}
Players: ${activePlayers.map((p) => p.name).join(", ")}
Emotions: ${girl.emotions.join(", ")}

Reply as JSON only (reason 30-200 chars):
{"destination":"player name, stay, or center","reason":"your NEW reaction, not a repeat of anything above","emotion":"how you feel"}`.trim();

  const decision = await runMovementDecision(
    movementSystemPrompt,
    roundSummary,
    roomID
  );

  console.log("Movement decision:", decision);

  // check if chosen player disconnected
  const dest = decision.destination || "stay";
  if (dest !== "stay" && dest !== "center") {
    const destLower = dest.trim().toLowerCase();
    const stillHere = players
      .getActivePlayers()
      .find((p) => p.name.toLowerCase() === destLower);

    if (!stillHere) {
      console.warn(`⚠️ [Room ${roomID}] Chosen player "${dest}" disconnected`);
      decision.reason = `I was gonna pick ${dest} but... they left. Whatever, none of you win this time.`;
      decision.destination = "stay";
    }
  }

  // always extract facts from every round (not just picks) and await so they're ready next turn
  try {
    const factRes = await extractRoundFacts(roundSummary, roomID, girl.memoryBank);
    if (factRes && Array.isArray(factRes.facts)) {
      for (const f of factRes.facts) {
        if (!girl.memoryBank.includes(f)) {
          girl.addMemory(f);
          console.log(`💡 [Room ${roomID}] extracted fact: ${f}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error extracting facts for room ${roomID}:`, err);
  }

  girl.movementDecision = {
    destination: decision.destination || "stay",
    reason: cleanGirlResponse(decision.reason || "..."),
    emotion: safeEmotion(decision.emotion || "neutral"),
  };

  return girl.movementDecision;
}
