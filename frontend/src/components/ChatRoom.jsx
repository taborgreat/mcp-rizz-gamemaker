import { useEffect, useState, useRef } from "react";

export default function ChatRoom({ socket, slotColors, players, spectators, playerName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showSpectatorMessages, setShowSpectatorMessages] = useState(false);

    const spectatorsRef = useRef(spectators);
    const playersRef = useRef(players);
    const messagesEndRef = useRef(null);

    const MAX_MESSAGES = 40;

    const isSelfSpectator = spectators?.some((s) => s.name === playerName);

    const isSpectatorMessage = (from) => {
        const specs = spectatorsRef.current || [];
        const plays = playersRef.current || [];
        const isInSpectators = specs.some(s => s.name === from);
        const isInPlayers = plays.some(p => p.name === from);
        return isInSpectators || !isInPlayers;
    };

    const getPlayerColor = (name) => {
        const player = players?.find((p) => p.name === name);
        if (player && slotColors[player.slot]) return slotColors[player.slot];
        return "#fff";
    };

    useEffect(() => {
        if (!messagesEndRef.current) return;
        const container = messagesEndRef.current.parentNode;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, showSpectatorMessages]);

    useEffect(() => {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
        setMessages([]);
    }
    if (!socket) return;

    const handler = (event) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.action) {
                case "chatMessage":
                    setMessages(prev => {
                        const next = [...prev, {
                            type: "chat",
                            from: data.from,
                            text: data.text,
                            isSpectator: isSpectatorMessage(data.from),
                        }];
                        return next.slice(-MAX_MESSAGES);
                    });
                    break;

                case "chatSystemMessage": {
                    const { type, text, name } = data.params;
                    const messageText =
                        text ||
                        (type === "playerJoined" ? `${name} joined the game.` :
                         type === "playerLeft" ? `${name} left the game.` : "");

                    setMessages(prev => [...prev, { type, text: messageText }]);
                    break;
                }

                default:
                    break;
            }
        } catch {}
    };

  

    socket.addEventListener("message", handler);


    return () => {
        socket.removeEventListener("message", handler);
  
    };
}, [socket]);




    useEffect(() => { spectatorsRef.current = spectators; }, [spectators]);
    useEffect(() => { playersRef.current = players; }, [players]);

    useEffect(() => {
        setMessages(prev =>
            prev.map(m =>
                m.type === "chat"
                    ? { ...m, isSpectator: isSpectatorMessage(m.from) }
                    : m
            )
        );
    }, [spectators, players]);

    const sendMessage = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN || !input.trim()) return;
        socket.send(JSON.stringify({ type: "newMessage", text: input }));
        setInput("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            {!isSelfSpectator && (
                <div style={{ marginBottom: "6px", display: "flex", justifyContent: "flex-end" }}>
                    <label style={{ color: "white", fontSize: "0.9rem" }}>
                        <input
                            type="checkbox"
                            checked={showSpectatorMessages}
                            onChange={() => setShowSpectatorMessages(!showSpectatorMessages)}
                            style={{ marginRight: "0.4rem" }}
                        />
                        Hide Spectators
                    </label>
                </div>
            )}

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "#222",
                    borderRadius: "8px",
                    padding: "0px",
                    marginBottom: "8px",
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {messages
                    .filter(m => !showSpectatorMessages || !m.isSpectator)
                    .map((m, i) => {
                        const color =
                            m.type === "chat" ? "#fff" :
                                m.type === "warning" ? "orange" :
                                    m.type === "kicked" ? "red" :
                                        "#aaa";

                        const isSelf = m.from === playerName;

                        return (
                            <div
                                key={i}
                                style={{
                                    color,
                                    padding: "1px",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    marginBottom: "0.5rem",
                                    background: isSelf ? "rgba(255, 255, 255, 0.05)" : "transparent",
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                {m.type === "chat" ? (
                                    <>
                                        <div
                                            style={{
                                                color: getPlayerColor(m.from),
                                                fontWeight: "bold",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
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

            <div style={{ display: "flex", flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder={socket ? "Type..." : "Connecting..."}
                    maxLength={120}
                    style={{
                        flex: 1,
                        marginRight: "0.5rem",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontSize: "16px",
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
                        font: "16px",
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
