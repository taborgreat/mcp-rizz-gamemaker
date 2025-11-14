import { Rooms } from "./core/Rooms.js";

const MAX_ROOMS = 10;
const MAX_PLAYERS_PER_ROOM = 10;

export const roomsInstance = new Rooms(MAX_ROOMS, MAX_PLAYERS_PER_ROOM);
