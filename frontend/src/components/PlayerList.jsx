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
        <div style={{ background: "#111", color: "white", padding: "1rem" }}>
            <h3 style={{ marginBottom: "8px" }}>Players</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {players.map((p) => (
                    <li key={p.name} style={{ marginBottom: "4px" }}>
                        {p.name} {p.spectator ? "(Spectator)" : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}
