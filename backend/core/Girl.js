const MAX_HEAD_STYLE = 3;
const MAX_HAIR_STYLE = 3;
const MAX_BODY_STYLE = 3;
const EMOTION_OPTIONS = [
  "ick",
  "disgusted",
  "flattered",
  "lovestruck",
  "neutral",
];

const BODY_DESCRIPTIONS = [
  "pink dress",
  "white dress",
  "dark purple dress",
];

const HAIR_DESCRIPTIONS = [
  "purple crow-like hair with freckles",
  "dirty blonde with a dread and green hair tie",
  "green hair with a gold ruby necklace",
];

export class Girl {
  constructor(broadcast, players) {
    this.center = { x: 240, y: 128 };
    this.name = "Waiting to be named";
    this.style = this.generateRandomStyle();
    this.emotion = "neutral";
    this.emotions = EMOTION_OPTIONS;
    this.x = this.center.x;
    this.y = this.center.y;
    this.speed = 25;
    this.personality = "";
    // trait-based profile (adjectives, not nouns — keeps 8B models from fixating)
    this.traits = [];
    this.conversationStyle = "";
    this.politicalLean = "neutral"; // left, right, or neutral
    this.recentEvents = []; // if shy, random things from last few days
    this.familyFacts = [];

    // rolling memory of notable facts generated during conversation turns
    this.memoryBank = [];

    this.broadcast = broadcast;
    this.players = players;
    this.movementDecision = { destination: "center", reason: "", emotion: "" };
    this.introMessage = "";
    this.introEmotion = "neutral";
  }

  generateRandomStyle() {
    const head = Math.floor(Math.random() * MAX_HEAD_STYLE);
    const hair = Math.floor(Math.random() * MAX_HAIR_STYLE);
    const body = Math.floor(Math.random() * MAX_BODY_STYLE);

    return [head, hair, body];
  }
  getLookDescription() {
    const [, hair, body] = this.style;
    const outfit = BODY_DESCRIPTIONS[body] || "a cute dress";
    const hairDesc = HAIR_DESCRIPTIONS[hair] || "styled hair";
    return `${hairDesc}, wearing a ${outfit}`;
  }

  generateRandomEmotion() {
    const i = Math.floor(Math.random() * EMOTION_OPTIONS.length);
    return EMOTION_OPTIONS[i];
  }

  getChairPosition(slot) {
    switch (slot) {
      case 1: // left
        return { x: 176, y: 128 };
      case 2: // right
        return { x: 304, y: 128 };
      case 3: // up
        return { x: 240, y: 64 };
      case 4: // down
        return { x: 240, y: 192 };
      default:
        return this.center;
    }
  }

  moveTowards(destination, handleGameWin) {
    const { broadcast, players } = this;
    let target;

    if (destination === "stay") {
      target = { x: this.x, y: this.y };
    } else if (destination === "center") {
      target = this.center;
    } else {
      const destLower = destination.trim().toLowerCase();
      const player = players
        .getActivePlayers()
        .find((p) => p.name.toLowerCase() === destLower);
      if (!player) {
        console.warn(`⚠️ Unknown destination "${destination}", treating as stay`);
        target = { x: this.x, y: this.y };
        this.movementDecision.reason = `wait, where'd ${destination} go? guess they couldn't handle me`;
        this.movementDecision.destination = "stay";
        destination = "stay";
      } else {
        destination = player.name;
        target = this.getChairPosition(player.slot);
      }
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const step = Math.min(this.speed, dist);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }

    const newDx = target.x - this.x;
    const newDy = target.y - this.y;
    const newDist = Math.sqrt(newDx * newDx + newDy * newDy);

    broadcast(players.players, {
      action: "updateGirl",
      params: { name: this.name, x: this.x, y: this.y, destination },
    });

    if (destination !== "center" && destination !== "stay" && newDist <= 10) {
      handleGameWin(destination);
      return { win: true, newPos: { x: this.x, y: this.y } };
    }

    return { win: false, newPos: { x: this.x, y: this.y } };
  }

  resetPosition() {
    const { broadcast, players } = this;
    this.x = this.center.x;
    this.y = this.center.y;
    this.emotion = "neutral";
    this.memoryBank = []; // clear memory on reset

    this.movementDecision = {
      destination: "center",
      reason: "",
      emotion: "neutral",
    };

    broadcast(players.players, {
      action: "updateGirl",
      params: {
        name: this.name,
        x: this.x,
        y: this.y,
        destination: "center",
      },
    });
  }
  getPersonaReference() {
    const parts = [];
    if (this.traits && this.traits.length) parts.push(`Traits: ${this.traits.join(", ")}`);
    if (this.conversationStyle) parts.push(`Style: ${this.conversationStyle}`);
    parts.push(`Political leaning: ${this.politicalLean}`);
    if (this.recentEvents && this.recentEvents.length)
      parts.push(`Recent events: ${this.recentEvents.join(", ")}`);
    if (this.familyFacts && this.familyFacts.length)
      parts.push(`Family facts: ${this.familyFacts.join(", ")}`);
    if (this.memoryBank && this.memoryBank.length)
      parts.push(`Memories: ${this.memoryBank.join(", ")}`);
    return parts.join("\n");
  }

  addMemory(fact) {
    if (!fact || typeof fact !== "string") return;
    this.memoryBank.push(fact);
    if (this.memoryBank.length > 15) {
      this.memoryBank.shift();
    }
  }

  getState() {
    return {
      x: this.x,
      y: this.y,
      name: this.name,
      style: this.style,
      emotion: this.emotion,
      personality: this.personality,
      traits: this.traits,
      conversationStyle: this.conversationStyle,
      politicalLean: this.politicalLean,
      recentEvents: this.recentEvents,
      familyFacts: this.familyFacts,
      memoryBank: this.memoryBank,
    };
  }
}
