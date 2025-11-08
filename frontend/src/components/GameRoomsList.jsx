import { useEffect, useState } from "react";

export default function GameRoomsList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);


    const fetchRooms = async () => {
        try {
            const res = await fetch("http://localhost:8082/roomsSummaries");
            const data = await res.json();
            setRooms(data.rooms || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        }
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 5000);
        return () => clearInterval(interval);
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
                                <div style={{ fontWeight: "bold" }}>
                                    Room {room.roomId}
                                </div>
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
