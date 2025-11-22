import { runRizzGameAI } from "../LLM.js";

export async function generateGirlThoughts(girl, players, roomID) {
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
    const decision = {
      roomId: roomID,
      destination: "stay",
      reason: "...",
      emotion: "neutral",
    };
    girl.movementDecision = decision;
    return decision;
  }

  const historyLines = activePlayers
    .flatMap((p) => {
      const lines = [];

      if (p.currentText && p.currentText !== "Player missed their turn") {
        lines.push(`HISTORY: ${p.name}: ${p.currentText}`);
      }

      if (p.latestGirlMessage && p.latestGirlMessage !== "...") {
        lines.push(`HISTORY: Girl→${p.name}: ${p.latestGirlMessage}`);
      }

      return lines;
    })
    .join("\n");

  const conversation = activePlayers
    .map((p) => `${p.name}: ${p.latestMessage}`)
    .join("\n");

  const prompt = `
Room ID: ${roomID}

You are ${girl.name}, the girl on stage. Personality:
"${girl.personality}"

Available emotions:
${girl.emotions}

${historyLines ? historyLines + "\n\n" : ""}

Players speaking:
${conversation}
  `.trim();

  console.log(prompt);
  const result = await runRizzGameAI(prompt);

  if (!result.toolCall) {
    console.error("❗ AI did not return a tool call:", result);
    return null;
  }

  return JSON.parse(result.result).decision;
}
