(function () {
  console.log("[Bridge] JS WebSocket bridge loaded (hardened).");

  window.connectToServer = function (playerName) {
    try {
      if (typeof playerName !== "string")
        playerName = String(playerName || "Player");

      window.socket = new WebSocket("ws://10.0.0.89:8082");

      socket.onopen = () => {
        try {
          socket.send(JSON.stringify({ type: "join", name: playerName }));
        } catch (e) {
          console.warn("[Bridge] Failed to send join message:", e);
        }
      };

      socket.onmessage = (event) => {
        try {
          const safeData =
            typeof event.data === "string"
              ? event.data
              : JSON.stringify(event.data || {});
          window.gml_Script_gmcallback_handleWebSocketMessage("", "", safeData);
        } catch (e) {
          console.warn("[Bridge] Failed to call gm_handleWebSocketMessage:", e);
        }
      };

      socket.onclose = (event) => {
        console.warn("[Bridge] WebSocket closed:", event);
        try {
          let safeCode = event?.code ?? 1000;
          if (safeCode === 1006) safeCode = 1000;

          const safeReason = String(event?.reason || "Connection was lost");

          window.gml_Script_gmcallback_handleSocketClosed(
            "",
            "",
            JSON.stringify({
              reason: safeReason,
              code: safeCode,
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
        console.warn("[Bridge] WebSocket error detected:", err);
        try {
          const state = socket?.readyState;

          if (state === WebSocket.CLOSING || state === WebSocket.CLOSED) {
            window.gml_Script_gmcallback_handleSocketClosed(
              "",
              "",
              JSON.stringify({
                reason: "Network error or connection lost",
                code: "1006",
              })
            );
          } else {
            console.log(
              "[Bridge] Minor WebSocket error ignored (socket still open)."
            );
          }
        } catch (e) {
          console.warn("[Bridge] Failed to handle WebSocket error safely:", e);
        }
      };

      window.sendToServer = function (msg) {
        try {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn("[Bridge] Tried to send but socket not ready.");
            return;
          }

          const safeMsg =
            typeof msg === "string" ? msg : JSON.stringify(msg || {});
          socket.send(safeMsg);
        } catch (e) {
          console.warn("[Bridge] sendToServer failed:", e);
        }
      };
    } catch (e) {
      console.error("[Bridge] connectToServer failed to initialize:", e);
    }
  };
})();
