export class GirlManager {
  constructor() {
    this.x = 735;
    this.y = 340;
  }

  moveTowards(target, broadcast, players) {
    this.x += (target.x - this.x) * 0.05;
    this.y += (target.y - this.y) * 0.05;
    broadcast(players, {
      action: "updateGirl",
      params: { x: this.x, y: this.y },
    });
  }
  getState() {
    return { x: this.x, y: this.y };
  }
}
