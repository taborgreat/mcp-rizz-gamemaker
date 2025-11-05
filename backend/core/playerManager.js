import { getUniqueName } from "./utils/utils.js";

export class PlayerManager {
  constructor() {
    this.players = new Map(); // ws -> { name, slot, latestMessage, isSpectator }
    this.maxPlayerSlots = 4;
  }

  addPlayer(ws, name) {
    const uniqueName = getUniqueName(name, this.getPlayerNames());

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

    this.players.set(ws, {
      name: uniqueName,
      slot,
      latestMessage: "Player missed their turn", //defaults to this in case missed input
      isSpectator,
    });
    return this.players.get(ws);
  }

  removePlayer(ws) {
    const left = this.players.get(ws);
    if (!left) return null;

    this.players.delete(ws);

    if (!left.isSpectator) {
      const spectator = this.getSpectators()[0];
      if (spectator) {
        spectator.slot = left.slot;
        spectator.isSpectator = false;
      }
    }

    return left;
  }

  getPlayerNames() {
    return Array.from(this.players.values()).map((p) => p.name);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getActivePlayers() {
    return Array.from(this.players.values())
      .filter((p) => !p.isSpectator)
      .sort((a, b) => a.slot - b.slot);
  }

  getSpectators() {
    return Array.from(this.players.values()).filter((p) => p.isSpectator);
  }

  findFirstOpenSlot(occupiedSlots) {
    for (let i = 1; i <= this.maxPlayerSlots; i++) {
      if (!occupiedSlots.includes(i)) return i;
    }
    return null;
  }
}
