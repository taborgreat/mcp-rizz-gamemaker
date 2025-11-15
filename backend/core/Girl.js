export class Girl {
  constructor(broadcast, players) {
    this.center = { x: 240, y: 120 };
    this.name = "Waiting to be named";
    this.x = this.center.x;
    this.y = this.center.y;
    this.speed = 50;

    this.broadcast = broadcast;
    this.players = players;
  }

  getChairPosition(slot) {
    switch (slot) {
      case 1: // left
        return { x: 170, y: 120 };
      case 2: // right
        return { x: 310, y: 110 };
      case 3: // up
        return { x: 240, y: 50 };
      case 4: // down
        return { x: 240, y: 190 };
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
    return { x: this.x, y: this.y, name: this.name };
  }
}
