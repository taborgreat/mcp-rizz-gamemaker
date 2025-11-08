import { RoomManager } from "./core/roomManager.js";

const MAX_ROOMS = 2;
const MAX_PLAYERS_PER_ROOM = 2;

export const roomManager = new RoomManager(MAX_ROOMS, MAX_PLAYERS_PER_ROOM);
