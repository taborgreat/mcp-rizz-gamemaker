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
                viewportMeta.content = 'width=device-width, initial-scale=1.0';

                // 2. Prevent input zooming
                let inputFixStyle = iframeDoc.getElementById('input-fix');
                if (inputFixStyle) inputFixStyle.remove();
                inputFixStyle = iframeDoc.createElement('style');
                inputFixStyle.id = 'input-fix';
                inputFixStyle.textContent = `
  /* Anchor the wrapper to the bottom center */
/* Anchor the wrapper to the bottom center */
.form-wrapper {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 100% !important;
  width: 90% !important;
  max-width: 500px !important;
  margin: 0 auto !important;
  padding: 8px !important;
  box-sizing: border-box !important;
  transform: translateY(-280%) !important;
  pointer-events: auto !important;
  z-index: 9999 !important;
}

.simple-form {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;        /* Critical: prevents wrapping */
  width: 100% !important;
  margin: 0 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  height: auto !important;
}

/* Input: takes available space */
.simple-form input[name="username"] {
  flex: 1 1 auto !important;           /* Grow and shrink, but has content */
  min-width: 0 !important;             /* Allows flex item to shrink below content size */
  padding: clamp(12px, 3vw, 18px) clamp(12px, 3vw, 16px) !important;
  font-size: clamp(22px, 4vw, 34px) !important;
  line-height: 1.4 !important;
  border: 2px solid #aaa !important;
  border-right: none !important;
  border-radius: 8px 0 0 8px !important;
  outline: none !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  background: white !important;
  color: #333 !important;
}

/* Button: never collapses, fixed min width */
.simple-form button[type="submit"] {
  flex: 0 0 auto !important;           /* Doesn't grow or shrink */
  min-width: 80px !important;          /* Ensures button stays visible */
  padding: 0 clamp(20px, 6vw, 40px) !important;
  font-size: clamp(12px, 4vw, 18px) !important;  /* Fixed: was 12x */
  font-weight: 600 !important;
  border: 2px solid #aaa !important;
  background: #390000ff !important;
  color: white !important;
  cursor: pointer !important;
  margin: 0 !important;
  white-space: nowrap !important;
  transition: background 0.2s ease !important;
}

.simple-form button[type="submit"]:hover,
.simple-form button[type="submit"]:focus {
  background: #ff0aefff !important;
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