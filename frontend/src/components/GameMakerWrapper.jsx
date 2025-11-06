export default function GameMakerWrapper() {
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <iframe
                id="gameFrame"
                src="/GameMaker/build/index.html"
                title="GameMaker Game"
                width="480"
                height="270"
                style={{
                    border: "none",
                    background: "black",
                }}
            />
        </div>
    );
}
