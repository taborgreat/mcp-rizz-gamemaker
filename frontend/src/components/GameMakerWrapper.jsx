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

                // Remove any existing injected style
                const existingStyle = iframeDoc.getElementById('scale-injection');
                if (existingStyle) existingStyle.remove();

                // Create new style element
                const style = iframeDoc.createElement('style');
                style.id = 'scale-injection';
                style.textContent = `
                
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

                iframeDoc.head.appendChild(style);
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