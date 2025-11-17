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
    const [showRoomList, setShowRoomList] = useState(false);

    const slotColors = {
        1: "#4da6ff",
        2: "#ff4d4d",
        3: "#4dff4d",
        4: "#ffff66",
    };

    useEffect(() => {
        setShowRoomList(false);
    }, [socketReady]);

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
            socket.close(1000, `${playerName} left the room`);
            setPlayerName(null)
        }
        setSocketReady(false);
        setSocket(null);
    };

    return (
        <div className="game-room">

            {socketReady ? (
                <header className="top-bar">
                    <div
                        className={`rizz-logo clickable`}
                        onClick={handleBack}
                    >
                        GOT RIZZ
                    </div>
                    <div>⚙️</div>
                </header>
            ) : (
                <>
                    <header
                        style={{
                            position: "relative",
                            top: 0,
                            left: 0,
                            background: "#d36ab5",
                            width: "100%",
                            textAlign: "center",
                            fontSize: "3rem",
                            fontWeight: "bold",
                            color: "black",
                            padding: "0.2rem 0",
                            zIndex: 1000, // keep above iframe or other elements
                        }}
                    >
                        GOT RIZZ

                    </header>

                </>
            )}


            <main className="main-area">
                {!socketReady && (
                    <div className="static-curtain"></div>
                )}

                {/* Left panel (always mounted but hidden when not connected) */}
                <aside className={`player-list ${!socketReady ? "hidden" : ""}`}>
                    <PlayerList
                        socket={socket}
                        slotColors={slotColors}
                        onSelfJoin={(name) => setPlayerName(name)}
                        onPlayersUpdate={({ players, spectators }) => {
                            setPlayers(players);
                            setSpectators(spectators);
                        }}
                    />
                </aside>

                {/* Game area */}
                <section className={`game-area ${socketReady ? "connected" : ""}`}>

                    <GameMakerWrapper isConnected={socketReady} />

                    {/* ✅ Only show toggle + panel when NOT connected */}
                    {!socketReady && (
                        <>
                            <button
                                className="room-list-toggle"
                                onClick={() => setShowRoomList((prev) => !prev)}
                            >
                                {showRoomList ? "✖" : "📜"}
                            </button>

                            {showRoomList && (
                                <div className="room-list-panel open">
                                    <GameRoomsList />
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Right panel (always mounted but hidden when not connected) */}
                <aside className={`chat-room ${!socketReady ? "hidden" : ""}`}>
                    <ChatRoom
                        socket={socket}
                        playerName={playerName}
                        spectators={spectators}
                        players={players}
                        slotColors={slotColors}
                    />
                </aside>


            </main>
            {/* 👇 Add this right below main, only when disconnected */}
            {!socketReady && (
                <div className="info-container">
                    <div className="info-card">
                        <div className="info-card-top"></div>
                        <div className="info-card-body">
                            <h3>How to Play</h3>
                            <p>Join a room, drop your best rizz lines, and win.</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-top"></div>
                        <div className="info-card-body">
                            <h3>News</h3>
                            <p>New skins</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-top"></div>
                        <div className="info-card-body">
                            <h3>About Us</h3>
                            <p>Holly's</p>
                        </div>
                    </div>
                </div>
            )}



            <footer className="ad-banner">AD BANNER</footer>
        </div >
    );
}
