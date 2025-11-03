(function () {
  console.log("[Bridge] JS WebSocket bridge loaded.");

  window.connectToServer = function (playerName) {
    console.log("[Bridge] Connecting as:", playerName);
    window.socket = new WebSocket("ws://localhost:8082");

    socket.onopen = () => {
      console.log("[Bridge] WebSocket connected");
      socket.send(JSON.stringify({ type: "join", name: playerName }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[Bridge] Received:", data);

      try {
        gm_handleWebSocketMessage(JSON.stringify(data));
      } catch (e) {
        console.warn("[Bridge] Failed to call gm_handleWebSocketMessage:", e);
      }
    };

    window.sendToServer = function (msg) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg));
      } else {
        console.warn("[Bridge] Tried to send but socket not ready.");
      }
    };
  };

  console.log("[Bridge] window.connectToServer() ready for GameMaker!");
})();
