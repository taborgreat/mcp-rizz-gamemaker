(function () {
  console.log("[Bridge] JS WebSocket bridge loaded (hardened).");

  window.connectToServer = function (playerName) {
    try {
      if (typeof playerName !== "string")
        playerName = String(playerName || "Player");

      window.socket = new WebSocket("ws://localhost:8082"); //injected from /frontend/injectENV.js

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
          safeGameMakerCall(
            "gml_Script_gmcallback_handleWebSocketMessage",
            "",
            "",
            safeData
          );
        } catch (e) {
          console.warn("[Bridge] Failed to call gm_handleWebSocketMessage:", e);
        }
      };

      socket.onclose = (event) => {
        console.warn("[Bridge] WebSocket closed:", event);

        // slight delay to avoid colliding with GameMaker room teardown
        setTimeout(() => {
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
              "[Bridge] Failed to call gmcallback_handleSocketClosed (delayed):",
              e
            );
          }
        }, 400); // tweak delay
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

function safeGameMakerCall(fnName, ...args) {
  const start = Date.now();
  const maxWait = 8000;
  const retryDelay = 500;

  function tryCall() {
    try {
      const fn = window[fnName];
      if (typeof fn === "function") {
        fn(...args);
        return;
      }
      throw new Error("Function not ready");
    } catch (err) {
      if (Date.now() - start < maxWait) {
        console.warn(
          `[Bridge] ${fnName} not ready or failed (${err.message}), retrying...`
        );
        setTimeout(tryCall, retryDelay);
      } else {
        console.warn(`[Bridge] Gave up on ${fnName} after ${maxWait / 1000}s.`);
      }
    }
  }

  tryCall();
}
