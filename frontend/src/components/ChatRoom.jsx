import { useEffect, useState, useRef } from "react";

export default function ChatRoom() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socketReady, setSocketReady] = useState(false);
    const messagesEndRef = useRef(null);

    // === Auto-scroll to bottom when messages update ===
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
            if (socket?._chatRoomHandler) {
                socket.removeEventListener("message", socket._chatRoomHandler);
                delete socket._chatRoomHandler;
            }
        };
    }, []);

    const setupListeners = (socket) => {
        if (socket._chatRoomHandler) return;

        const handler = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.action) {
                    case "chatMessage":
                        setMessages((prev) => [
                            ...prev,
                            { type: "chat", from: data.from, text: data.text },
                        ]);
                        break;

                    case "playerJoinedForChat":
                        setMessages((prev) => [
                            ...prev,
                            { type: "system", text: `${data.params.name} joined the game.` },
                        ]);
                        break;

                    case "playerLeftForChat":
                        setMessages((prev) => [
                            ...prev,
                            { type: "system", text: `${data.params.name} left the game.` },
                        ]);
                        break;

                    default:
                        break;
                }
            } catch {
                // ignore bad JSON
            }
        };

        socket._chatRoomHandler = handler;
        socket.addEventListener("message", handler);
    };

    const sendMessage = () => {
        const iframe = document.getElementById("gameFrame");
        const gmWindow = iframe?.contentWindow;
        const socket = gmWindow?.socket;

        if (!socket) return;
        if (socket.readyState !== WebSocket.OPEN) return;
        if (!input.trim()) return;

        const msg = { type: "newMessage", text: input };
        socket.send(JSON.stringify(msg));
        setInput("");
    };

    return (
        <div
            style={{
                background: "#111",
                color: "white",
                padding: "1rem",
                height: "70vh", // ensures it fills viewport
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            {/* === Scrollable message area === */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "#222",
                    borderRadius: "8px",
                    padding: "8px",
                    marginBottom: "8px",
                    minHeight: 0, // 🔑 fixes flexbox overflow behavior
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {messages.map((m, i) => (
                    <div key={i} style={{ color: m.type === "system" ? "#aaa" : "#fff" }}>
                        {m.type === "chat" ? (
                            <>
                                <b>{m.from}:</b> {m.text}
                            </>
                        ) : (
                            <i>{m.text}</i>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* === Fixed bottom input bar === */}
            <div style={{ display: "flex", flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={socketReady ? "Type a message..." : "Connecting..."}
                    style={{
                        flex: 1,
                        marginRight: "0.5rem",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "none",
                        outline: "none",
                    }}
                    disabled={!socketReady}
                />
                <button
                    onClick={sendMessage}
                    disabled={!socketReady}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "none",
                        background: socketReady ? "#444" : "#333",
                        color: "white",
                        cursor: socketReady ? "pointer" : "not-allowed",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
