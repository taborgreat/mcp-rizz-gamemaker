const MAX_HEAD_STYLE = 3;
const MAX_HAIR_STYLE = 3;
const MAX_BODY_STYLE = 3;
const EMOTION_OPTIONS = ["sad", "happy", "angry", "neutral"];

export class Girl {
  constructor(broadcast, players) {
    this.center = { x: 240, y: 128 };
    this.name = "Waiting to be named";
    this.style = this.generateRandomStyle();
    this.emotion = "neutral";
    this.emotions = EMOTION_OPTIONS;
    this.x = this.center.x;
    this.y = this.center.y;
    this.speed = 50;
    this.personality = "Happy";
    this.broadcast = broadcast;
    this.players = players;
    this.movementDecision = { destination: "center", reason: "", emotion: "" };
  }

  generateRandomStyle() {
    const head = Math.floor(Math.random() * MAX_HEAD_STYLE);
    const hair = Math.floor(Math.random() * MAX_HAIR_STYLE);
    const body = Math.floor(Math.random() * MAX_BODY_STYLE);

    return [head, hair, body];
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
      const player = players
        .getActivePlayers()
        .find((p) => p.name === destination);
      target = player
        ? this.getChairPosition(player.slot)
        : { x: this.x, y: this.y };
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

  getState() {
    return {
      x: this.x,
      y: this.y,
      name: this.name,
      style: this.style,
      emotion: this.emotion,
    };
  }
}
