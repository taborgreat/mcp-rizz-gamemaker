export function generateGirlMessage(players) {
  const activePlayers = players.getActivePlayers();
  const allMessages = activePlayers.map((p) => p.latestMessage || "").join(" ");
  const missedAll = activePlayers.every(
    (p) => p.latestMessage === "Player missed their turn"
  );

  if (missedAll) {
    return "WHERE IS EVERYONE???";
  }

  const responses = [
    "That was fun to hear from you all!",
    "Oh wow, you guys really have a way with words!",
    "Haha, that one made me laugh!",
    "You’re all so funny today!",
    "I can’t believe you said that!",
    "That’s actually kind of sweet…",
    "Hmm… interesting perspective!",
    "I wasn’t expecting that one!",
    "Wow, bold move!",
    "Are you trying to impress me?",
    "You guys sound so different every round.",
    "I feel like I’m really getting to know you all!",
    "Keep it coming, I love hearing from you.",
    "That was… unexpected.",
    "You all have such unique styles!",
    "Oh, this is getting interesting!",
    "I didn’t quite catch that — say it again?",
    "You’re all full of surprises!",
    "That’s kinda deep… I like that.",
    "You all make this so entertaining!",
  ];

  // 🎯 Custom contextual reactions
  if (allMessages.includes("?"))
    return "Hmm... interesting question! I dont have a brain.";
  if (allMessages.toLowerCase().includes("love"))
    return "Aww, that’s so sweet!";
  if (allMessages.toLowerCase().includes("hate")) return "Whoa… harsh!";
  if (allMessages.toLowerCase().includes("fun"))
    return "Glad you’re having fun!";
  if (allMessages.trim() === "") return "You’re all so quiet...";

  return responses[Math.floor(Math.random() * responses.length)];
}
