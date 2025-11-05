export class GirlManager {
  constructor() {
    this.center = { x: 766, y: 340 };
    this.x = this.center.x;
    this.y = this.center.y;
    this.speed = 70; // pixels per tick
  }

  getChairPosition(slot) {
    switch (slot) {
      case 1:
        return { x: 416, y: 384 };
      case 2:
        return { x: 1088, y: 384 };
      case 3:
        return { x: 736, y: 96 };
      case 4:
        return { x: 736, y: 672 };
      default:
        return this.center;
    }
  }

  moveTowards(destination, broadcast, players) {
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

    // Broadcast new girl position
    broadcast(players.players, {
      action: "updateGirl",
      params: { x: this.x, y: this.y, destination },
    });

    // Check for collision (close enough to "touch")
    if (destination !== "center" && destination !== "stay" && dist < 10) {
      broadcast(players.players, {
        action: "playerWon",
        params: { name: destination },
      });
    }

    return { x: this.x, y: this.y };
  }

  resetPosition(broadcast, players) {
    this.x = this.center.x;
    this.y = this.center.y;

    if (broadcast && players) {
      broadcast(players.players, {
        action: "updateGirl",
        params: { x: this.x, y: this.y, destination: "center" },
      });
    }
  }

  getState() {
    return { x: this.x, y: this.y };
  }
}
