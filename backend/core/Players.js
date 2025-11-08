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

  getSpectators() {
    return this.getAllPlayers().filter((p) => p.isSpectator);
  }

  countPlayers() {
    return this.players.size;
  }

  getPlayerNames() {
    return Array.from(this.players.values()).map((p) => p.name);
  }

  findFirstOpenSlot(occupiedSlots) {
    for (let i = 1; i <= this.maxPlayerSlots; i++) {
      if (!occupiedSlots.includes(i)) return i;
    }
    return null;
  }
}
