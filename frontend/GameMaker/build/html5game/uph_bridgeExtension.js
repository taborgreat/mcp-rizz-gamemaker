(function () {
  console.log("[Bridge] JS WebSocket bridge loaded.");

  window.connectToServer = function (playerName) {
    window.socket = new WebSocket("ws://10.0.0.89:8082");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", name: playerName }));
    };

    socket.onmessage = (event) => {
      try {
        window.gml_Script_gmcallback_handleWebSocketMessage("", "", event.data);
      } catch (e) {
        console.warn("[Bridge] Failed to call gm_handleWebSocketMessage:", e);
      }
    };

    window.sendToServer = function (msg) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
      } else {
        console.warn("[Bridge] Tried to send but socket not ready.");
      }
    };
  };
})();
