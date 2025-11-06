import { useEffect, useState, useRef } from "react";

export default function ChatRoom({ socket }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // === Auto-scroll to bottom when messages update ===
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // === Set up socket listeners ===
    useEffect(() => {
        if (!socket) return;

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
                // ignore non-JSON messages
            }
        };

        socket.addEventListener("message", handler);
        return () => socket.removeEventListener("message", handler);
    }, [socket]);

    // === Send message ===
    const sendMessage = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN || !input.trim()) return;
        socket.send(JSON.stringify({ type: "newMessage", text: input }));
        setInput("");
    };

    // === Render ===
    return (
        <div
            style={{
                background: "#111",
                color: "white",
                padding: "1rem",
                height: "70vh",
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
                    minHeight: 0,
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

            {/* === Input bar === */}
            <div style={{ display: "flex", flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={socket ? "Type a message..." : "Connecting..."}
                    style={{
                        flex: 1,
                        marginRight: "0.5rem",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "none",
                        outline: "none",
                    }}
                    disabled={!socket}
                />
                <button
                    onClick={sendMessage}
                    disabled={!socket}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "none",
                        background: socket ? "#444" : "#333",
                        color: "white",
                        cursor: socket ? "pointer" : "not-allowed",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
