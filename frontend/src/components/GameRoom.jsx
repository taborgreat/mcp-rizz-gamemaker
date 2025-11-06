import { useEffect, useState } from "react";
import "./GameRoom.css";
import GameMakerWrapper from "./GameMakerWrapper";
import ChatRoom from "./ChatRoom";
import PlayerList from "./PlayerList";
import GameRoomsList from "./GameRoomsList";

export default function GameRoom() {
    const [socketReady, setSocketReady] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let interval;

        const tryConnect = () => {
            const iframe = document.getElementById("gameFrame");
            const gmWindow = iframe?.contentWindow;
            if (!gmWindow) return;

            const sock = gmWindow.socket;
            if (sock && sock.readyState === WebSocket.OPEN) {
                setSocket(sock);
                setSocketReady(true);
                clearInterval(interval);
            }
        };

        interval = setInterval(tryConnect, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="game-room">
            <header className="top-bar">
                <div>RIZZ</div>
                <div>⚙️</div>
            </header>

            <main className="main-area">
                {/* Left panel */}
                <aside className="player-list">
                    {socketReady && socket && <PlayerList socket={socket} />}
                </aside>


                <section className="game-area">
                    <GameMakerWrapper />
                </section>

                {/* Right panel */}
                <aside className="chat-room">
                    {socketReady && socket ? (
                        <ChatRoom socket={socket} />
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
