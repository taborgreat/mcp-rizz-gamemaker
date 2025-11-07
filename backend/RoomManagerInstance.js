import { RoomManager } from "./core/roomManager.js";

const MAX_ROOMS = 5;
const MAX_PLAYERS_PER_ROOM = 8;

export const roomManager = new RoomManager(MAX_ROOMS, MAX_PLAYERS_PER_ROOM);
