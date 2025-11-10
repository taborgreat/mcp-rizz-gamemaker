import { useEffect, useState } from "react";

export default function GameRoomsList() {
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

  // Only fetch once on mount
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
  };

  return (
    <div
      style={{
        background: "#111",
        color: "white",
        padding: "1rem",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* 🔄 Refresh Button */}
      <button
        onClick={fetchRooms}
        disabled={refreshing}
        style={{
          alignSelf: "center",
          background: "#1a1a1a",
          color: "#ddd",
          border: "1px solid #333",
          borderRadius: "6px",
          padding: "8px 16px",
          fontWeight: "bold",
          cursor: refreshing ? "wait" : "pointer",
          marginBottom: "10px",
          width: "100%",
          transition: "all 0.2s ease",
          opacity: refreshing ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!refreshing) e.currentTarget.style.background = "#262626";
        }}
        onMouseLeave={(e) => {
          if (!refreshing) e.currentTarget.style.background = "#1a1a1a";
        }}
      >
        {refreshing ? "Refreshing..." : "🔄 Refresh Rooms"}
      </button>


      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#222",
          borderRadius: "8px",
          padding: "8px",
          minHeight: 0,
        }}
      >
        {loading ? (
          <p style={{ color: "#aaa", textAlign: "center" }}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center" }}>No rooms available</p>
        ) : (
          rooms.map((room) => {
            const isSelected = selectedRoom === room.roomId;
            return (
              <div
                key={room.roomId}
                onClick={() => handleRoomClick(room.roomId)}
                style={{
                  background: isSelected ? "#333" : "#1a1a1a",
                  border: isSelected
                    ? "1px solid #777"
                    : "1px solid transparent",
                  borderRadius: "6px",
                  padding: "8px",
                  marginBottom: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "#262626";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "#1a1a1a";
                }}
              >
                <div style={{ fontWeight: "bold" }}>Room {room.roomId}</div>
                <div style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {room.currentPlayers}/{room.maxPlayers} players
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
