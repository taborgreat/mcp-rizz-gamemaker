import { useEffect, useRef } from "react";

export default function GameMakerWrapper({ isConnected = false }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const injectStyles = () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc) return;

                // 1. Fix the viewport meta
                let viewportMeta = iframeDoc.querySelector('meta[name="viewport"]');
                if (!viewportMeta) {
                    viewportMeta = iframeDoc.createElement('meta');
                    viewportMeta.name = 'viewport';
                    iframeDoc.head.appendChild(viewportMeta);
                }
                viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';

                // 2. Prevent input zooming
                let inputFixStyle = iframeDoc.getElementById('input-fix');
                if (inputFixStyle) inputFixStyle.remove();
                inputFixStyle = iframeDoc.createElement('style');
                inputFixStyle.id = 'input-fix';
                inputFixStyle.textContent = `
/* ── Name-entry form (pre-game) ── */
#form-wrapper {
  position: fixed !important;
  left: 50% !important;
  top: auto !important;
  bottom: 10% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 520px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  pointer-events: auto !important;
  z-index: 9999 !important;
}

@media (max-width: 480px) {
  #form-wrapper {
    width: 94% !important;
    bottom: 8% !important;
  }
  .simple-form input[name="username"] {
    padding: 13px 14px !important;
    font-size: 16px !important;
  }
  .simple-form button[type="submit"] {
    min-width: 70px !important;
    padding: 13px 16px !important;
    font-size: 13px !important;
  }
}

/* ── In-game message input ── */
.message-wrapper {
  position: fixed !important;
  left: 50% !important;
  top: auto !important;
  bottom: 12% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 520px !important;
  box-sizing: border-box !important;
  pointer-events: auto !important;
  z-index: 9999 !important;
}

.message-form {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  width: 100% !important;
  margin: 0 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: rgba(10, 0, 20, 0.55) !important;
  backdrop-filter: blur(24px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.4) !important;
  border: 1px solid rgba(211, 106, 181, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.07) !important;
}

.message-form input[name="playerMessage"] {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  padding: 18px 20px !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  border: none !important;
  border-right: 1px solid rgba(211, 106, 181, 0.25) !important;
  border-radius: 0 !important;
  outline: none !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
  color: #fff !important;
  caret-color: #d36ab5 !important;
  touch-action: manipulation !important;
  -webkit-appearance: none !important;
  -webkit-text-size-adjust: 100% !important;
  font-family: sans-serif !important;
}

.message-form input[name="playerMessage"]::placeholder {
  color: rgba(255, 255, 255, 0.35) !important;
}

.message-form input[name="playerMessage"]:focus {
  background: rgba(211, 106, 181, 0.06) !important;
}

.message-form button[type="submit"] {
  flex: 0 0 auto !important;
  min-width: 88px !important;
  padding: 18px 28px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  border: none !important;
  background: rgba(211, 106, 181, 0.65) !important;
  color: #fff !important;
  cursor: pointer !important;
  margin: 0 !important;
  white-space: nowrap !important;
  transition: background 0.2s ease !important;
  touch-action: manipulation !important;
  -webkit-appearance: none !important;
  font-family: sans-serif !important;
}

.message-form button[type="submit"]:hover,
.message-form button[type="submit"]:active {
  background: rgba(255, 10, 239, 0.75) !important;
}

.simple-form {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  width: 100% !important;
  margin: 0 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: rgba(10, 0, 20, 0.55) !important;
  backdrop-filter: blur(24px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.4) !important;
  border: 1px solid rgba(211, 106, 181, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.07) !important;
  height: auto !important;
}

.simple-form input[name="username"] {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  padding: clamp(10px, 3.5vw, 18px) clamp(12px, 4vw, 20px) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  border: none !important;
  border-right: 1px solid rgba(211, 106, 181, 0.25) !important;
  border-radius: 0 !important;
  outline: none !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
  color: #fff !important;
  caret-color: #d36ab5 !important;
  touch-action: manipulation !important;
  -webkit-appearance: none !important;
  -webkit-text-size-adjust: 100% !important;
}

.simple-form input[name="username"]::placeholder {
  color: rgba(255, 255, 255, 0.35) !important;
}

.simple-form input[name="username"]:focus {
  background: rgba(211, 106, 181, 0.06) !important;
}

.simple-form button[type="submit"] {
  flex: 0 0 auto !important;
  min-width: clamp(60px, 18vw, 88px) !important;
  padding: clamp(10px, 3.5vw, 18px) clamp(12px, 5vw, 28px) !important;
  font-size: clamp(12px, 3vw, 14px) !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  border: none !important;
  background: rgba(211, 106, 181, 0.65) !important;
  color: #fff !important;
  cursor: pointer !important;
  margin: 0 !important;
  white-space: nowrap !important;
  transition: background 0.2s ease !important;
  touch-action: manipulation !important;
  -webkit-appearance: none !important;
}

.simple-form button[type="submit"]:hover,
.simple-form button[type="submit"]:active {
  background: rgba(255, 10, 239, 0.75) !important;
}
`;
                iframeDoc.head.appendChild(inputFixStyle);



                // 3. Inject scaling styles - DYNAMIC based on connection
                let scaleStyle = iframeDoc.getElementById('scale-injection');
                if (scaleStyle) scaleStyle.remove();

                scaleStyle = iframeDoc.createElement('style');
                scaleStyle.id = 'scale-injection';
                scaleStyle.textContent = `
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        background: #000 !important;
    }

    #gm4html5_div_id {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        background: #000 !important;
    }

    #canvas {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        margin: 0 auto !important;
        object-fit: fill !important;  /* Changed from contain to fill */
    }
`;
                iframeDoc.head.appendChild(scaleStyle);

            } catch (e) {
                console.warn('Could not inject styles into iframe:', e);
            }
        };

        injectStyles();
        iframe.addEventListener('load', injectStyles);
        const interval = setInterval(injectStyles, 500);

        return () => {
            clearInterval(interval);
            iframe.removeEventListener('load', injectStyles);
        };
    }, [isConnected]); // Re-run when connection status changes

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#000",
                overflow: "hidden",
            }}
        >
            <iframe
                id="gameFrame"
                ref={iframeRef}
                src="/GameMaker/build/index.html"
                title="GameMaker Game"
                style={{
                    border: "none",
                    width: "100%",
                    height: "100%",
                    display: "block",
                    overflow: "hidden",
                }}
            />
        </div>
    );
}