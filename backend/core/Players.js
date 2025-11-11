import { getUniqueName } from "./utils/utils.js";

export class Players {
  constructor() {
    this.players = new Map(); // ws -> player object
    this.maxPlayerSlots = 4;
  }

  addPlayer(ws, name) {
    const MAX_NAME_LENGTH = 13;
    let rawName = (name ?? "").trim();
    if (!rawName) rawName = "Player";

    if (rawName.length > MAX_NAME_LENGTH) {
      rawName = rawName.slice(0, MAX_NAME_LENGTH);
    }
    const ensuredUnique = getUniqueName(rawName, this.getPlayerNames());

    // find open slot (1–4)
    const occupiedSlots = this.getActivePlayers().map((p) => p.slot);
    const openSlot = this.findFirstOpenSlot(occupiedSlots);

    let slot, isSpectator;

    if (openSlot) {
      slot = openSlot;
      isSpectator = false;
    } else {
      slot = this.players.size + 1;
      isSpectator = true;
    }

    const player = {
      name: ensuredUnique,
      slot,
      latestMessage: "Player missed their turn",
      isSpectator,
    };

    this.players.set(ws, player);
    return player;
  }

  removePlayer(ws) {
    const left = this.players.get(ws);
    if (!left) return null;

    this.players.delete(ws);

    // maintain slot order
    if (!left.isSpectator) {
      const spectator = this.getSpectators()[0];
      if (spectator) {
        spectator.slot = left.slot;
        spectator.isSpectator = false;
      }
    }

    return left;
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getActivePlayers() {
    return this.getAllPlayers()
      .filter((p) => !p.isSpectator)
      .sort((a, b) => a.slot - b.slot);
  }
  resetAllRanksToTie() {
    for (const player of this.getAllPlayers()) {
      player.rank = "tie";
    }
  }

  getSpectators() {
    return this.getAllPlayers().filter((p) => p.isSpectator);
  }

  countPlayers() {
    return this.players.size;
  }

  getPlayerNames() {
    return Array.from(this.players.values()).map((p) => p.name);
  }

  updateRanks(girl, broadcast) {
    // Skip ranking if girl hasn't moved from center

    const girlAtCenter =
      girl && girl.x === girl.center.x && girl.y === girl.center.y;

    if (girlAtCenter) {
      return;
    }

    const activePlayers = this.getActivePlayers();

    const distances = activePlayers.map((p) => {
      const chair = girl.getChairPosition(p.slot);
      const d = Math.ceil(
        Math.sqrt((girl.x - chair.x) ** 2 + (girl.y - chair.y) ** 2)
      );
      return { player: p, dist: d };
    });

    const allEqual = distances.every((d) => d.dist === distances[0].dist);
    if (allEqual) {
      for (const { player } of distances) player.rank = "tie";
    } else {
      distances.sort((a, b) => a.dist - b.dist);
      let currentRank = 1;
      distances[0].player.rank = currentRank;
      for (let i = 1; i < distances.length; i++) {
        if (distances[i].dist !== distances[i - 1].dist) currentRank++;
        distances[i].player.rank = currentRank;
      }
    }

    if (typeof broadcast === "function") {
      broadcast(this.players, {
        action: "ranksUpdated",
        players: this.getAllPlayers(),
      });
    }
  }

  findFirstOpenSlot(occupiedSlots) {
    for (let i = 1; i <= this.maxPlayerSlots; i++) {
      if (!occupiedSlots.includes(i)) return i;
    }
    return null;
  }
  winReset(winnerName) {
    const allPlayers = this.getAllPlayers();
    if (allPlayers.length <= this.maxPlayerSlots) return;

    const activePlayers = this.getActivePlayers();
    const spectators = this.getSpectators();

    // Find the winner
    const winner = activePlayers.find((p) => p.name === winnerName);
    if (!winner) {
      console.warn("⚠️ Winner not found among active players");
      return;
    }

    const winnerSlot = winner.slot;

    // Losers go to spectator queue end
    const losers = activePlayers.filter((p) => p.name !== winnerName);
    losers.forEach((loser) => {
      loser.isSpectator = true;
      loser.slot = this.maxPlayerSlots + 999; // temp push to end
    });

    // Determine open active slots (excluding winner)
    const openSlots = [];
    for (let i = 1; i <= this.maxPlayerSlots; i++) {
      if (i !== winnerSlot) openSlots.push(i);
    }

    // Bring in top spectators to fill open slots
    const newActives = spectators.slice(0, openSlots.length);
    newActives.forEach((spec, i) => {
      spec.slot = openSlots[i];
      spec.isSpectator = false;
    });

    // Remaining spectators: old spectators (minus those promoted) + losers pushed to end
    const remainingSpectators = spectators
      .slice(openSlots.length)
      .concat(losers);

    // Assign clean slots sequentially after actives
    let nextSlot = this.maxPlayerSlots + 1;
    for (const spec of remainingSpectators) {
      spec.isSpectator = true;
      spec.slot = nextSlot++;
    }

    // Ensure winner stays in correct slot (in case something shifted)
    winner.slot = winnerSlot;
    winner.isSpectator = false;

    console.log(
      "🎯 Win reset complete:",
      this.getAllPlayers().map((p) => ({
        name: p.name,
        slot: p.slot,
        spectator: p.isSpectator,
      }))
    );
  }
}
