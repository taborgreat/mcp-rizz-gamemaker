import { runRizzGameAI } from "../LLM.js";

export async function generateGirlThoughts(girl, players, roomID) {
  const allPlayers = players.getActivePlayers();

  const activePlayers = allPlayers.filter(
    (p) => p.latestMessage && p.latestMessage !== "Player missed their turn"
  );

  const missedPlayers = allPlayers.filter((p) => !activePlayers.includes(p));

  // missed tu reset settings
  for (const p of missedPlayers) {
    p.latestGirlMessage = "...";
    p.latestGirlListeningEmotion = "neutral";
    p.latestGirlResponseEmotion = "neutral";
  }

  //all players missed, no ai fallback
  if (activePlayers.length === 0) {
    console.log("⚠️ All players missed — using fallback response.");

    const decision = {
      roomId: roomID,
      destination: "stay",
      reason: "...", //someday set this to like 20 random sayings
      emotion: "neutral",
    };

    girl.movementDecision = decision;
    return decision;
  }

  //prompt build
  const conversation = activePlayers
    .map((p) => `${p.name}: ${p.latestMessage}`)
    .join("\n");

  const prompt = `
Room ID: ${roomID}

You are ${girl.name}, the girl on stage. Personality:
"${girl.personality}"

Available emotions:
${girl.emotions}

Players speaking:
${conversation}
  `.trim();

  const result = await runRizzGameAI(prompt);

  if (!result.toolCall) {
    console.error("❗ AI did not return a tool call:", result);
    return null;
  }

  return JSON.parse(result.result).decision;
}
