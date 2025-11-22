import { getUniqueName } from "./utils/utils.js";

export class Players {
  constructor() {
    this.players = new Map(); // ws -> player object
    this.maxPlayerSlots = 4;
  }

  addPlayer(ws, name, style) {
    const MAX_NAME_LENGTH = 13;
    let rawName = (name ?? "").trim();
    if (!rawName) rawName = "Player";

    if (rawName.length > MAX_NAME_LENGTH) {
      rawName = rawName.slice(0, MAX_NAME_LENGTH);
    }

    //check twice to prevent rare race conditions

    const existing = this.getPlayerNames();
    let finalName = getUniqueName(rawName, existing);

    finalName = getUniqueName(finalName, this.getPlayerNames());

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
      name: finalName,
      slot,
      latestMessage: "Player missed their turn",
      isSpectator,
      style,
      latestGirlMessage: "I have nothing to say",
      latestGirlListeningEmotion: "neutral",
      latestGirlResponseEmotion: "neutral",
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
  getPlayerByName(name) {
    return this.getAllPlayers().find((p) => p.name === name) || null;
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

    if (allPlayers.length <= this.maxPlayerSlots) {
      return;
    }

    const winner = allPlayers.find((p) => p.name === winnerName);
    if (!winner) return;

    // 1. Identify active and spectator groups cleanly
    const activePlayers = this.getActivePlayers();
    const losers = activePlayers.filter((p) => p !== winner);

    // 2. Build a single spectator queue:
    //    existing spectators first, then losers (added to the end)
    const spectatorQueue = [
      ...this.getSpectators(), // original spectators
      ...losers, // losers always go to the BACK
    ];

    // 3. Assign winner back to his slot
    winner.isSpectator = false;

    // 4. Fill every other player slot with spectators from the queue
    const newActives = [winner];
    const openSlots = [];

    for (let i = 1; i <= this.maxPlayerSlots; i++) {
      if (i !== winner.slot) {
        openSlots.push(i);
      }
    }

    for (let i = 0; i < openSlots.length; i++) {
      const spec = spectatorQueue.shift(); // take next spectator
      if (!spec) break;

      spec.isSpectator = false;
      spec.slot = openSlots[i];
      newActives.push(spec);
    }

    // 5. Everyone not in newActives is now spectator
    const activeSet = new Set(newActives);

    const remainingSpectators = allPlayers.filter((p) => !activeSet.has(p));

    // 6. Assign spectator slots sequentially
    let nextSlot = this.maxPlayerSlots + 1;
    for (const p of remainingSpectators) {
      p.isSpectator = true;
      p.slot = nextSlot++;
    }

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
