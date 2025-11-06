import { RoomManager } from "./core/roomManager.js";

const MAX_ROOMS = 100;
const MAX_PLAYERS_PER_ROOM = 10;

export const roomManager = new RoomManager(MAX_ROOMS, MAX_PLAYERS_PER_ROOM);
