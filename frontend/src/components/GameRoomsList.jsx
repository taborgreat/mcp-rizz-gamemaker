import { useEffect, useState } from "react";

export default function GameRoomsList({ onRoomSelected }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = import.meta.env.VITE_SERVER_URL;

  const fetchRooms = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/roomsSummaries`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomClick = (roomId) => {
    setSelectedRoom(roomId);
    const iframe = document.getElementById("gameFrame");
    const gmWindow = iframe?.contentWindow;
    if (!gmWindow || !gmWindow.gml_Script_gmcallback_setRoomSelected) {
      console.warn("⚠️ GameMaker window or callback not ready");
      return;
    }
    gmWindow.gml_Script_gmcallback_setRoomSelected("", "", String(roomId));
    if (onRoomSelected) onRoomSelected(roomId);
  };

  return (
    <div className="rooms-list">
      <h3 className="rooms-list-title">Servers</h3>

      <button
        className={`rooms-refresh-btn ${refreshing ? "refreshing" : ""}`}
        onClick={fetchRooms}
        disabled={refreshing}
      >
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>

      <div className="rooms-scroll">
        {loading ? (
          <p className="rooms-empty">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="rooms-empty">No rooms available</p>
        ) : (
          rooms.map((room) => {
            const isSelected = selectedRoom === room.roomId;
            const isFull = room.currentPlayers >= room.maxPlayers;
            return (
              <div
                key={room.roomId}
                className={`rooms-item ${isSelected ? "selected" : ""} ${isFull ? "full" : ""}`}
                onClick={() => handleRoomClick(room.roomId)}
              >
                <span className="rooms-item-name">Room {room.roomId}</span>
                <span className="rooms-item-count">
                  {room.currentPlayers}/{room.maxPlayers}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
