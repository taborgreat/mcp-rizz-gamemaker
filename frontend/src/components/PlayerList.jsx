import { useEffect, useState } from "react";

export default function PlayerList({ socket }) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handler = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.action) {
                    case "worldUpdate": {
                        const world = data.world;
                        if (world && Array.isArray(world.players)) {
                            setPlayers(world.players);
                        }
                        break;
                    }
                    default:
                        break;
                }
            } catch (err) {
                // ignore non-JSON messages
            }
        };

        socket.addEventListener("message", handler);
        return () => socket.removeEventListener("message", handler);
    }, [socket]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%"
        }}>
            <h3 style={{
                marginTop: 0,
                marginBottom: "12px",
                color: "white"
            }}>
                Players
            </h3>
            <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: "white",
                overflowY: "auto",
                flex: 1
            }}>
                {players.map((p) => (
                    <li key={p.name} style={{
                        marginBottom: "8px",
                        padding: "4px 8px",
                        background: "#333",
                        borderRadius: "4px"
                    }}>
                        {p.name} {p.spectator ? "(Spectator)" : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}
