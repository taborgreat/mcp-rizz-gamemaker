import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./GameRoom.css";
import GameMakerWrapper from "./GameMakerWrapper";
import ChatRoom from "./ChatRoom";
import PlayerList from "./PlayerList";
import GameRoomsList from "./GameRoomsList";
import SettingsMenu from "./SettingsMenu";

export default function GameRoom() {
    const [socketReady, setSocketReady] = useState(false);
    const [socket, setSocket] = useState(null);
    const [players, setPlayers] = useState([]);
    const [spectators, setSpectators] = useState([]);
    const [playerName, setPlayerName] = useState(null);
    const [showRoomList, setShowRoomList] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showSpectatorMessages, setShowSpectatorMessages] = useState(false);

    const slotColors = {
        1: "#4da6ff",
        2: "#ff4d4d",
        3: "#4dff4d",
        4: "#ffff66",
    };

    useEffect(() => {
        setShowRoomList(false);

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        })

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
                <div className="top-bar">
                    <div
                        className={`rizz-logo clickable`}
                        onClick={handleBack}
                    >
                        RIZZ OFF
                    </div>
                    <div onClick={() => setShowSettings(true)}>⚙️</div>
                </div>
            ) : (
                <>
                    <header
                        className="rizz-title"
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
                        RIZZ OFF
                        <div style={{
                            fontSize: "1rem",
                            fontWeight: "normal",
                            color: "black",
                            marginTop: "0.1rem",
                        }}>
                            May The Best Rizz Win
                        </div>
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
                        hideSpectators={showSpectatorMessages}
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
                                    <GameRoomsList onRoomSelected={() => setShowRoomList(false)} />
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
                        showSpectatorMessages={showSpectatorMessages}
                    />
                </aside>


            </main>
            {/* 👇 Add this right below main, only when disconnected */}
            {!socketReady && (
                <>
                    <div className="info-container">
                        <div className="info-card">
                            <div className="info-card-top"></div>
                            <div className="info-card-body">
                                <h3>How to Play</h3>
                                <p>
                                    Choose your name, look, and then join a room. You'll need at least two players to get started.
                                    You're all on a stage with a girl in the middle. Each round you get 25 seconds
                                    to type your best rizz and try to impress her. She'll respond to everyone's
                                    lines, then move toward whoever she's feeling the most. First person she
                                    reaches wins. Be a chad, or get rekt. It's that simple.
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-top"></div>
                            <div className="info-card-body">
                                <h3>News</h3>
                                <p>
                                    <strong>v0.2 &mdash; She Remembers Now</strong><br />
                                    The girl now has improved memory. She'll remember what you said in
                                    previous rounds and build real opinions about each player over time.
                                    No more starting from scratch every round.
                                </p>
                                <p style={{ marginTop: "0.75rem" }}>
                                    <strong>Coming Soon</strong><br />
                                    New character skins, sound effects, and music. Stay tuned.
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-top"></div>
                            <div className="info-card-body">
                                <h3>About</h3>
                                <p>
                                    RIZZ OFF is a multiplayer party game where every round plays out
                                    differently. Each girl has her own personality, her own style, and her
                                    own way of reacting to what you say. The conversations are fully
                                    generative so nothing is scripted, and the game goes in whatever
                                    direction the players take it.
                                </p>
                                <p style={{ marginTop: "0.75rem" }}>
                                    Built by Holly's.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="social-icons">
                        <div className="icon-wrapper">
                            <a className="icon-link" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M20 10.061C20 4.504 15.523 0 10 0S0 4.504 0 10.061C0 15.083 3.657 19.245 8.437 20v-7.031H5.898v-2.908h2.539V7.845c0-2.522 1.494-3.915 3.778-3.915 1.094 0 2.238.196 2.238.196v2.477h-1.261c-1.242 0-1.63.775-1.63 1.571v1.887h2.774l-.443 2.908h-2.331V20C16.343 19.245 20 15.083 20 10.061Z" />
                                </svg>
                            </a>
                        </div>
                        <div className="icon-wrapper">
                            <a className="icon-link" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M15.338 3.462a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4M10 13.332a3.333 3.333 0 1 1 0-6.664 3.333 3.333 0 0 1 0 6.665m0-8.468a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27M10 0C7.284 0 6.943.012 5.877.06 4.813.109 4.086.278 3.45.525a4.9 4.9 0 0 0-1.772 1.153A4.9 4.9 0 0 0 .525 3.45C.278 4.086.109 4.813.06 5.877.011 6.944 0 7.284 0 10s.011 3.057.06 4.123c.049 1.065.218 1.79.465 2.428a4.9 4.9 0 0 0 1.153 1.77 4.9 4.9 0 0 0 1.772 1.154c.636.248 1.363.417 2.427.465 1.066.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.065-.048 1.791-.217 2.427-.465a4.9 4.9 0 0 0 1.771-1.154 4.9 4.9 0 0 0 1.154-1.77c.247-.637.416-1.363.465-2.428.048-1.066.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.9 4.9 0 0 0-1.154-1.772A4.9 4.9 0 0 0 16.55.525C15.914.278 15.188.109 14.123.06 13.056.012 12.716 0 10 0m0 1.802c2.67 0 2.986.01 4.041.058.975.045 1.505.207 1.857.345.466.18.799.398 1.149.748.351.349.567.683.749 1.149.137.353.299.882.344 1.857.048 1.055.058 1.37.058 4.04s-.01 2.987-.058 4.042c-.045.975-.207 1.504-.344 1.857a3.1 3.1 0 0 1-.749 1.15c-.35.35-.683.566-1.149.748-.352.137-.882.3-1.857.344-1.055.049-1.37.058-4.041.058-2.67 0-2.987-.01-4.041-.058-.975-.044-1.504-.207-1.857-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.371-.058-4.041s.01-2.986.058-4.041c.044-.975.207-1.504.344-1.857.182-.466.399-.8.748-1.15a3.1 3.1 0 0 1 1.15-.747c.353-.138.882-.3 1.857-.345C7.014 1.812 7.33 1.802 10 1.802" />
                                </svg>
                            </a>
                        </div>
                        <div className="icon-wrapper">
                            <a className="icon-link" target="_blank" rel="noopener noreferrer" href="https://www.twitter.com" aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M6.29 18.254c7.547 0 11.675-6.253 11.675-11.675q0-.266-.012-.53A8.3 8.3 0 0 0 20 3.924a8.2 8.2 0 0 1-2.356.646 4.12 4.12 0 0 0 1.804-2.27 8.2 8.2 0 0 1-2.606.996A4.104 4.104 0 0 0 9.85 7.039a11.65 11.65 0 0 1-8.458-4.287 4.1 4.1 0 0 0 1.27 5.477 4.06 4.06 0 0 1-1.858-.513l-.001.052a4.104 4.104 0 0 0 3.292 4.023 4.1 4.1 0 0 1-1.853.07 4.11 4.11 0 0 0 3.833 2.85 8.23 8.23 0 0 1-5.096 1.757A8 8 0 0 1 0 16.411a11.6 11.6 0 0 0 6.29 1.843" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <Link to="/terms">Terms of Service</Link>
                        <span className="footer-divider">|</span>
                        <Link to="/privacy">Privacy Policy</Link>
                    </div>
                </>
            )}



            {showSettings && (
                <SettingsMenu
                    onClose={() => setShowSettings(false)}
                    showSpectatorMessages={showSpectatorMessages}
                    onToggleSpectators={() => setShowSpectatorMessages(prev => !prev)}
                    isSelfSpectator={spectators?.some(s => s.name === playerName)}
                />
            )}

            <footer className="ad-banner">AD BANNER</footer>
        </div >
    );
}
