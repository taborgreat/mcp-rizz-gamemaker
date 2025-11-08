import { sanitizeMessage } from "./utils/utils.js";
export function broadcast(clients, msg) {
  const safe = {
    ...msg,
    from: msg.from ? sanitizeMessage(msg.from) : msg.from,
    text: msg.text ? sanitizeMessage(msg.text) : msg.text,
  };
  const payload = JSON.stringify(safe);
  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
