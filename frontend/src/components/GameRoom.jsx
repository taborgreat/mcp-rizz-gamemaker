import "./GameRoom.css";
import GameMakerWrapper from "./GameMakerWrapper";
import ChatRoom from "./ChatRoom";
import PlayerList from "./PlayerList";

export default function GameRoom() {
    return (
        <div className="game-room">


            <header className="top-bar">
                <div>RIZZ</div>
                <div>⚙️</div>
            </header>


            <main className="main-area">
                <aside className="player-list">
                    <PlayerList />
                </aside>

                <section className="game-area">
                    <GameMakerWrapper />
                </section>

                <aside className="chat-room">
                    <ChatRoom />
                </aside>
            </main>


            <footer className="ad-banner">
                AD BANNER
            </footer>

        </div>
    );
}
