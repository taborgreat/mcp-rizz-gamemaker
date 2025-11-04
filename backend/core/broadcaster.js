export function broadcast(players, msg) {
  const data = JSON.stringify(msg);
  for (const [ws] of players) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}
