import { runRizzGameAI } from "../LLM.js";

export async function generateGirlThoughts(girl, players, roomID) {
  const allPlayers = players.getActivePlayers();

  const activePlayers = allPlayers.filter(
    (p) => p.latestMessage && p.latestMessage !== "Player missed their turn"
  );

  const allMissed = activePlayers.length === 0;

  if (allMissed) {
    console.log(
      "⚠️ All players missed their turn — using default fallback AI response."
    );

    // reset players last messages to "..." from the girl
    for (const p of allPlayers) {
      p.latestGirlMessage = "...";
      p.latestGirlListeningEmotion = "neutral";
      p.latestGirlResponseEmotion = "neutral";
    }

    const movementDecision = {
      roomId: roomID,
      destination: "stay",
      reason: "...",
      emotion: "neutral",
    };

    girl.movementDecision = movementDecision;

    return movementDecision;
  }

  const conversation = activePlayers
    .map((p) => `${p.name}: ${p.latestMessage}`)
    .join("\n");

  const prompt = `
Room ID: ${roomID}

You are ${girl.name}, a girl with the following personality:
"${girl.personality}"

Your available emotions:
${girl.emotions}

Players speaking to you:
${conversation}
`.trim();

  const aiResponse = await runRizzGameAI(prompt);

  const { toolCalls = [] } = aiResponse;

  let movementDecision = null;

  for (const toolCall of toolCalls) {
    const name = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    if (name === "player_response") {
      const player = players.getPlayerByName(args.user);

      if (player) {
        player.latestGirlMessage = args.response;
        player.latestGirlListeningEmotion = args.listeningEmotion;
        player.latestGirlResponseEmotion = args.responseEmotion;
      }
    }

    if (name === "turn_decision_response") {
      movementDecision = args;
    }
  }

  if (movementDecision) {
    girl.movementDecision = movementDecision;
  } else {
    console.warn("❗ No movement decision produced");
  }

  return movementDecision;
}
