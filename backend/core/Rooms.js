import {roomPlayers} from "../metricsServer.js"

import { GameState } from "./GameState.js";
import { Girl } from "./Girl.js";
import { Players } from "./Players.js";
import { broadcast } from "./Broadcaster.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Rooms {
  constructor(maxRooms, maxPlayersPerRoom) {
    this.maxRooms = maxRooms;
    this.maxPlayersPerRoom = maxPlayersPerRoom;
    this.rooms = new Map();
    this.initRooms();
  }

  initRooms() {
    for (let i = 0; i < this.maxRooms; i++) {
      const players = new Players();
      const girl = new Girl(broadcast, players);
      const state = new GameState(broadcast, girl, players, i);
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

  async joinRoom(ws, name, requestedRoomId, playerStyle) {
    const roomId = requestedRoomId != null ? Number(requestedRoomId) : null;

    // determine which room to assign
    let assignedRoom = null;

    if (roomId !== null && this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId);
      if (room.players.players.size >= this.maxPlayersPerRoom) {
        ws.close(1000, "Room is full");
        return null;
      }
      assignedRoom = roomId;
    } else {
      console.warn(`❌ No valid room requested, finding open room...`);
      const openRoom = this.findAvailableRoom();
      if (openRoom === null) {
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

    const player = players.addPlayer(ws, name, playerStyle);
    player.gameRoomId = assignedRoom;
    players.updateRanks(girl, broadcast);
    console.log(
      `👥 ${player.name} joined room ${assignedRoom} with style ${playerStyle}`
    );

    await sleep(500); //small delay to let frontend load
    // notify individual player for game room and santised name
    ws.send(
      JSON.stringify({
        action: "playerJoined",
        params: { gameRoomId: player.gameRoomId, name: player.name },
      })
    );
    broadcast(players.players, {
      action: "chatSystemMessage",
      params: {
        type: "playerJoined",
        name: player.name,
      },
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
    roomPlayers.labels(assignedRoom).inc();


    return player;
  }

  handlePlayerDisconnect(ws) {
    const player = this.getPlayerBySocket(ws);
    if (!player) return;

    const room = this.getRoom(player.gameRoomId);
    if (!room) return;

    const { players, state } = room;

    broadcast(players.players, {
      action: "chatSystemMessage",
      params: {
        type: "playerLeft",
        name: player.name,
      },
    });

    players.removePlayer(ws);
    state.onPlayerLeft(player);
    roomPlayers.labels(player.gameRoomId).dec();
    sleep(500);
    state.broadcastWorld();
  }
  getRoomsSummaries() {
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
