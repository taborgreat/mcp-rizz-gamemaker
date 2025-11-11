import { useEffect, useState } from "react";

export default function PlayerList({ socket, onPlayersUpdate, slotColors, onSelfJoin }) {
    const [players, setPlayers] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [selfName, setSelfName] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handler = (event) => {
            //console.log("RAW MESSAGE:", event.data);

            try {
                const data = JSON.parse(event.data);
                switch (data.action) {
                    case "worldUpdate": {
                        const world = data.world;
                        if (world && Array.isArray(world.players)) {
                            setPlayers(world.players);
                            setRoomId(data.gameRoomId ?? world.gameRoomId ?? null);
                            if (onPlayersUpdate) {
                                const actives = world.players.filter((p) => !p.isSpectator);
                                const specs = world.players.filter((p) => p.isSpectator);
                                onPlayersUpdate({ players: actives, spectators: specs });
                            }
                        }
                        break;

                    }
                    case "playerJoined": {
                        const { name, gameRoomId } = data.params || {};
                        setSelfName(name);
                        if (onSelfJoin) onSelfJoin(name);

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

    const activePlayers = players.filter((p) => !p.isSpectator);
    const spectators = players.filter((p) => p.isSpectator);

    const sortedPlayers = [...activePlayers].sort((a, b) => {
        if (a.rank === "tie" && b.rank === "tie") return 0;
        if (a.rank === "tie") return 1;
        if (b.rank === "tie") return -1;
        return (a.rank ?? 99) - (b.rank ?? 99);
    });



    const rankSuffix = (rank) => {
        if (rank === "tie" || !rank) return "";
        if (rank === 1) return "1st";
        if (rank === 2) return "2nd";
        if (rank === 3) return "3rd";
        return `${rank}th`;
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                color: "white",
            }}
        >
            <h3 style={{ margin: "0 0 12px 0" }}>Room: {roomId ?? "?"}</h3>

            <ul
                style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    overflowY: "auto",
                    flex: 1,
                }}
            >

                {sortedPlayers.map((p) => {
                    const isSelf = p.name === selfName;

                    return (
                        <li
                            key={p.name}
                            style={{
                                marginBottom: "8px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                borderRight: isSelf ? "4px solid #c1a260ff" : "",

                                background: "#222",
                                borderLeft: `5px solid ${slotColors[p.slot] || "#555"}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span>{p.name}</span>
                            <span style={{ opacity: 0.8 }}>
                                {rankSuffix(p.rank) ? `${rankSuffix(p.rank)}` : ""}
                            </span>
                        </li>
                    );
                })}

                {spectators.length > 0 && (
                    <>
                        <hr style={{ border: "none", borderTop: "1px solid #444" }} />
                        {spectators.map((p) => (
                            <li
                                key={p.name}
                                style={{
                                    marginBottom: "6px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    background: "#111",
                                    color: "#aaa",
                                }}
                            >
                                👁️ {p.name}
                            </li>
                        ))}
                    </>
                )}
            </ul>
        </div>
    );
}
