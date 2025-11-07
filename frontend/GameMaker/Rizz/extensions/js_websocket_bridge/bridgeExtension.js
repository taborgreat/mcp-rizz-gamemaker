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

    socket.onclose = (event) => {
      console.warn("[Bridge] WebSocket closed:", event);
      try {
        window.gml_Script_gmcallback_handleSocketClosed(
          "",
          "",
          JSON.stringify({
            reason: event.reason || "Connection closed",
            code: event.code,
          })
        );
      } catch (e) {
        console.warn(
          "[Bridge] Failed to call gmcallback_handleSocketClosed:",
          e
        );
      }
    };

    socket.onerror = (err) => {
      console.error("[Bridge] WebSocket error:", err);
      try {
        window.gml_Script_gmcallback_handleSocketClosed(
          "",
          "",
          JSON.stringify({
            reason: "Network error",
          })
        );
      } catch (e) {
        console.warn(
          "[Bridge] Failed to call gmcallback_handleSocketClosed:",
          e
        );
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
