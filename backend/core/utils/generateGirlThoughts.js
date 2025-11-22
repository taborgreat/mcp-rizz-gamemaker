import { callMCP } from "../../mcp/client.js";

export async function generateGirlThoughts(girl, players, roomID) {
  const allPlayers = players.getActivePlayers();

  const conversation = allPlayers
    .map((p) => `${p.name}: ${p.latestMessage}`)
    .join("\n");

  const prompt = `
  Room ID = 
You are ${girl.name}, a girl with the following personality: "${girl.personality}".

The emotions available to you are ${girl.emotions}

There are 1–4 people who are trying to gain your interest.

Respond to each one in 100 characters or less.  
Include BOTH:
- the emotion you felt while listening  
- the emotion you feel while responding  

Use the player-response() tool for EACH PLAYER.

Then, after responding to ALL players, decide movement:
- stay
- center
- or move toward a specific player

Use turn-decision-response() for that.

---
Conversation:
${conversation}
  `.trim();

  console.log(
    "\n\n===================== MCP PROMPT SENT ====================="
  );
  console.log(prompt);
  console.log("============================================================\n");

  // ---------------------------------------------------------
  // 🔮 Send prompt to MCP server (NOT directly to OpenAI)
  // ---------------------------------------------------------
  const mcpResponse = await callMCP(prompt);

  console.log("\n===================== RAW MCP RESPONSE =====================");
  console.dir(mcpResponse, { depth: 10 });
  console.log("===========================================================\n");

  // ---------------------------------------------------------
  // 🔧 Extract tool calls from MCP result
  // ---------------------------------------------------------
  const toolCalls =
    mcpResponse?.result?.content?.filter(
      (item) => item.type === "tool" || item.tool
    ) || [];

  let movementDecision = null;

  for (const toolCall of toolCalls) {
    const name = toolCall.tool?.name || toolCall.name;
    const args = toolCall.tool?.arguments || toolCall.arguments;

    console.log("------------------------------------------------------------");
    console.log("🔧 TOOL CALL RECEIVED:");
    console.log("Tool Name:", name);
    console.log("Args:", args);
    console.log("------------------------------------------------------------");

    /* -------------------------------------------------------
     * PLAYER RESPONSE TOOL
     * ------------------------------------------------------*/
    if (name === "player_response") {
      console.log("\n🧍 Processing PLAYER_RESPONSE");

      const player = players.getPlayerByName(args.user);

      if (player) {
        console.log(`➤ Found Player: ${player.name}`);
        console.log("  - Girl response:", args.response);
        console.log("  - Listening emotion:", args.listeningEmotion);
        console.log("  - Response emotion:", args.responseEmotion);

        player.latestGirlMessage = args.response;
        player.latestGirlListeningEmotion = args.listeningEmotion;
        player.latestGirlResponseEmotion = args.responseEmotion;
      } else {
        console.warn(`[MCP] ⚠ Could not find player '${args.user}'`);
      }
    }

    /* -------------------------------------------------------
     * MOVEMENT DECISION TOOL
     * ------------------------------------------------------*/
    if (name === "turn_decision_response") {
      console.log("\n💃 Processing TURN_DECISION_RESPONSE");
      movementDecision = args;
    }
  }

  // ---------------------------------------------------------
  // 💾 Save final state
  // ---------------------------------------------------------
  if (movementDecision) {
    console.log("\n📌 Saving movement decision to GIRL OBJECT...");
    girl.movementDecision = movementDecision;
  } else {
    console.warn("\n❗ No movementDecision was produced by the LLM!");
  }

  console.log(
    "\n===================== FINAL MOVEMENT DECISION ====================="
  );
  console.log(girl.movementDecision);
  console.log(
    "===================================================================\n"
  );

  return movementDecision;
}
