import { GameStateManager } from "./gameStateManager.js";
import { GirlManager } from "./girlManager.js";
import { PlayerManager } from "./playerManager.js";
import { broadcast } from "./broadcaster.js";

export class RoomManager {
  constructor(maxRooms, maxPlayersPerRoom) {
    this.maxRooms = maxRooms;
    this.maxPlayersPerRoom = maxPlayersPerRoom;
    this.rooms = new Map();
    this.initRooms();
  }

  initRooms() {
    for (let i = 0; i < this.maxRooms; i++) {
      const players = new PlayerManager();
      const girl = new GirlManager();
      const state = new GameStateManager(broadcast, girl, players, i);
      this.rooms.set(i, { players, girl, state });
    }
    console.log(`🛏️ Initialized ${this.maxRooms} rooms`);
  }

  findAvailableRoom() {
    for (const [id, { players }] of this.rooms.entries()) {
      if (players.players.size < this.maxPlayersPerRoom) return id;
    }
    return null;
  }

  getRoom(id) {
    return this.rooms.get(id);
  }

  getPlayerBySocket(ws) {
    for (const { players } of this.rooms.values()) {
      const player = players.players.get(ws);
      if (player) return player;
    }
    return null;
  }

  joinRoom(ws, name, requestedRoomId) {
    const roomId = Number(requestedRoomId);

    // determine which room to assign
    let assignedRoom = null;

    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId);

      if (room.players.players.size >= this.maxPlayersPerRoom) {
        console.warn(
          `🚫 Room ${roomId} is full (${room.players.players.size}/${this.maxPlayersPerRoom})`
        );
        ws.send(JSON.stringify({ action: "roomFull", gameRoomId: roomId }));
        ws.close(1000, "Room is full");
        return null;
      }

      assignedRoom = roomId;
    } else {
      console.warn(
        `❌ Requested room ${roomId} not found, finding open room...`
      );
      const openRoom = this.findAvailableRoom();
      if (openRoom === null) {
        console.error("🚨 All rooms are full!");
        ws.send(JSON.stringify({ action: "allRoomsFull" }));
        ws.close(1000, "All rooms are full");
        return null;
      }

      assignedRoom = openRoom;
    }

    const roomData = this.rooms.get(assignedRoom);
    if (!roomData) {
      console.error(`❗ Failed to fetch room data for ${assignedRoom}`);
      return null;
    }

    const { players, girl, state } = roomData;

    const player = players.addPlayer(ws, name);
    player.gameRoomId = assignedRoom;

    console.log(`👥 ${player.name} joined room ${assignedRoom}`);

    // notify individual player for game room and santised name
    ws.send(
      JSON.stringify({
        action: "playerJoined",
        params: { gameRoomId: player.gameRoomId, name: player.name },
      })
    );

    broadcast(players.players, {
      action: "playerJoinedForChat",
      params: { name: player.name },
    });

    ws.send(
      JSON.stringify({
        action: "worldUpdate",
        world: {
          gameState: state.state,
          players: players.getAllPlayers(assignedRoom),
          girl: girl.getState(),
        },
      })
    );

    state.onPlayerJoined(player);

    return player;
  }

  handlePlayerDisconnect(ws) {
    const player = this.getPlayerBySocket(ws);
    if (!player) return;

    const room = this.getRoom(player.gameRoomId);
    if (!room) return;

    const { players, state } = room;

    broadcast(players.players, {
      action: "playerLeftForChat",
      params: { name: player.name },
    });

    players.removePlayer(ws);
    state.onPlayerLeft(player);
    state.broadcastWorld();
  }
  getRoomSummaries() {
    const summaries = [];
    for (const [id, { players }] of this.rooms.entries()) {
      summaries.push({
        roomId: id,
        currentPlayers: players.players.size,
        maxPlayers: this.maxPlayersPerRoom,
      });
    }
    return summaries;
  }
}
