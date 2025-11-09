import { useEffect, useState, useRef } from "react";

export default function ChatRoom({ socket }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);



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

                    case "chatSystemMessage": {
                        const { type, text, name } = data.params;
                        let messageText = text;

                        if (!messageText) {
                            if (type === "playerJoined") messageText = `${name} joined the game.`;
                            else if (type === "playerLeft") messageText = `${name} left the game.`;
                        }

                        setMessages((prev) => [
                            ...prev,
                            { type, text: messageText },
                        ]);
                        break;
                    }

                    default:
                        break;
                }
            } catch {
            }
        };

        socket.addEventListener("message", handler);
        return () => socket.removeEventListener("message", handler);
    }, [socket]);

    const sendMessage = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN || !input.trim()) return;
        socket.send(JSON.stringify({ type: "newMessage", text: input }));
        setInput("");
    };


    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
            }}
        >
            {/* Scrollable message area */}
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
                {messages.map((m, i) => {
                    const color =
                        m.type === "chat" ? "#fff" :
                            m.type === "warning" ? "orange" :
                                m.type === "kicked" ? "red" :
                                    "#aaa";

                    return (
                        <div
                            key={i}
                            style={{
                                color,
                                padding: "1px",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                marginBottom: "0.75rem",
                                borderBottom: "1px solid rgba(255,255,255,0.1)",
                                paddingBottom: "0.25rem",
                            }}
                        >
                            {m.type === "chat" ? (
                                <>
                                    <div style={{ fontWeight: "bold", marginBottom: "0.2rem" }}>
                                        {m.from}:
                                    </div>
                                    <div style={{ paddingLeft: "0.1rem", paddingBottom: "1rem" }}>
                                        {m.text}
                                    </div>
                                </>
                            ) : (
                                <i>{m.text}</i>
                            )}
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ display: "flex", flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={socket ? "Type a message..." : "Connecting..."}
                    maxLength={120}
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