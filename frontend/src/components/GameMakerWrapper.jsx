import { useEffect, useRef, useState } from "react";

export default function GameMakerWrapper() {
    const iframeRef = useRef(null);

    // Inject CSS into iframe to scale the canvas
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const injectStyles = () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc) return;

                // 1. Fix the viewport meta so zoom is allowed normally
                let viewportMeta = iframeDoc.querySelector('meta[name="viewport"]');
                if (!viewportMeta) {
                    viewportMeta = iframeDoc.createElement('meta');
                    viewportMeta.name = 'viewport';
                    iframeDoc.head.appendChild(viewportMeta);
                }
                viewportMeta.content = 'width=device-width, initial-scale=1.0';

                // 2. Prevent input zooming by keeping their font size 16px+
                let inputFixStyle = iframeDoc.getElementById('input-fix');
                if (inputFixStyle) inputFixStyle.remove();
                inputFixStyle = iframeDoc.createElement('style');
                inputFixStyle.id = 'input-fix';
                inputFixStyle.textContent = `
            input, textarea, select {
        font-size: 16px !important;              /* Prevent iPhone zoom */
        transform: scale(0.75);                  /* 16 * 0.75 = visually ~12px */
        transform-origin: center center;         /* Scale from center */
        -webkit-text-size-adjust: 100% !important;
        text-align: center !important;           /* Center text */
        display: block !important;
        margin: 0 auto !important;               /* Center element itself */
    }
        `;
                iframeDoc.head.appendChild(inputFixStyle);

                // 3. Inject your scaling styles
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
                object-fit: fill !important;
                display: block !important;
            }
        `;
                iframeDoc.head.appendChild(scaleStyle);

            } catch (e) {
                console.warn('Could not inject styles into iframe:', e);
            }
        };

        // Try to inject immediately
        injectStyles();

        // Also try after iframe loads
        iframe.addEventListener('load', injectStyles);

        // Retry periodically in case content loads later
        const interval = setInterval(injectStyles, 500);

        return () => {
            clearInterval(interval);
            iframe.removeEventListener('load', injectStyles);
        };
    }, []);

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