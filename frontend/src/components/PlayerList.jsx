import { useEffect, useState } from "react";

export default function PlayerList() {
    const [players, setPlayers] = useState([]);
    const [socketReady, setSocketReady] = useState(false);

    useEffect(() => {
        let interval;
        let socket;

        const tryConnect = () => {
            const iframe = document.getElementById("gameFrame");
            const gmWindow = iframe?.contentWindow;
            if (!gmWindow) return;

            socket = gmWindow.socket;
            if (!socket) return;

            if (socket.readyState === WebSocket.OPEN) {
                setupListeners(socket);
                setSocketReady(true);
                clearInterval(interval);
            }
        };

        interval = setInterval(tryConnect, 500);

        return () => {
            clearInterval(interval);
            if (socket?._playerListHandler) {
                socket.removeEventListener("message", socket._playerListHandler);
                delete socket._playerListHandler;
            }
        };
    }, []);

    const setupListeners = (socket) => {
        if (socket._playerListHandler) return;

        const handler = (event) => {

            const data = JSON.parse(event.data);

            switch (data.action) {
                case "worldUpdate": {
                    const world = data.world;
                    if (world && Array.isArray(world.players)) {
                        setPlayers(world.players);
                    }
                    break;
                }
                case "playerJoined":

                default:
                    break;
            }

        };

        socket._playerListHandler = handler;
        socket.addEventListener("message", handler);
    };

    return (
        <div style={{ background: "#111", color: "white", padding: "1rem" }}>
            <h3 style={{ marginBottom: "8px" }}>
                Players {socketReady ? "" : "(Connecting...)"}
            </h3>
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
