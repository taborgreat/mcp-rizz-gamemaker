import { useEffect, useState } from "react";
import "./GameRoom.css";
import GameMakerWrapper from "./GameMakerWrapper";
import ChatRoom from "./ChatRoom";
import PlayerList from "./PlayerList";
import GameRoomsList from "./GameRoomsList";

export default function GameRoom() {
    const [socketReady, setSocketReady] = useState(false);
    const [socket, setSocket] = useState(null);
    const [players, setPlayers] = useState([]);
    const [spectators, setSpectators] = useState([]);
    const [playerName, setPlayerName] = useState(null);


    const slotColors = {
        1: "#4da6ff", // blue
        2: "#ff4d4d", // red
        3: "#4dff4d", // green
        4: "#ffff66", // yellow
    };

    useEffect(() => {
        let interval;

        const tryConnect = () => {
            const iframe = document.getElementById("gameFrame");
            const gmWindow = iframe?.contentWindow;
            if (!gmWindow) return;

            const sock = gmWindow.socket;
            if (sock && sock.readyState === WebSocket.OPEN) {

                if (!sock._hasCloseHandler) {
                    sock._hasCloseHandler = true;
                    sock.addEventListener("close", () => {
                        console.warn("🔌 Socket closed");
                        setSocketReady(false);
                        setSocket(null);
                    });
                }

                setSocket(sock);
                setSocketReady(true);
                clearInterval(interval);
            }
        };

        interval = setInterval(tryConnect, 500);
        return () => clearInterval(interval);
    }, [socketReady]);

    const handleBack = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("👋 Closing socket and returning to room list");
            socket.close(1000, "User left room");
        }
        setSocketReady(false);
        setSocket(null);
    };

    return (
        <div className="game-room">
            <header className="top-bar">
                <div
                    className={`rizz-logo ${socketReady ? "clickable" : ""}`}
                    onClick={socketReady ? handleBack : undefined}
                >
                    RIZZ
                </div>
                <div>⚙️</div>
            </header>

            <main className="main-area">
                {/* Left panel */}
                <aside className="player-list">
                    {socketReady && socket && (
                        <PlayerList
                            socket={socket}
                            slotColors={slotColors}
                            onSelfJoin={(name) => setPlayerName(name)}
                            onPlayersUpdate={({ players, spectators }) => {
                                setPlayers(players);
                                setSpectators(spectators);
                            }}

                        />
                    )}
                </aside>



                <section className="game-area">
                    <GameMakerWrapper />
                </section>

                {/* Right panel */}
                <aside className="chat-room">
                    {socketReady && socket ? (
                        <ChatRoom socket={socket}
                            playerName={playerName}
                            spectators={spectators} players={players} slotColors={slotColors} />
                    ) : (
                        <GameRoomsList />
                    )}
                </aside>
            </main>

            <footer className="ad-banner">
                AD BANNER
            </footer>
        </div>
    );
}
