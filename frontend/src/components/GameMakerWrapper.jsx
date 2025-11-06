export default function GameMakerWrapper() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "black",
                overflow: "hidden",
            }}
        >
            <iframe
                id="gameFrame"
                src="/GameMaker/build/index.html"
                title="GameMaker Game"
                style={{
                    border: "none",
                    width: "100%",
                    height: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "contain",
                }}
            />
        </div>
    );
}
