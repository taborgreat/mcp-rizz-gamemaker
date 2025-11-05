html_init("HTML5Elements")

html_style(
	"@keyframes spinner",
	"to", "{transform: rotate(360deg);}"
);

html_style(
	".loading:before",
	"content", "''",
	"box-sizing", "border-box",
	"position", "absolute",
	"width", "20px",
	"height", "20px",
	"margin-top", "-20px",
	"border-radius", "50%",
	"border", "2px solid #ccc",
	"border-top-color", "#333",
	"animation", "spinner .6s linear infinite",
	"right", "-20px"
);

html_style(
	".tooltip",
	"background", "gray",
	"padding", ".3em"
)

html_style(
	".scrollable",
	"width", "200px",
	"height", "200px",
	"background", "white",
	"color", "black",
	"overflow", "hidden scroll",
	"top", "100px",
	"left", "20px",
	"padding", "0px 1em"
);

html_style(
	".styled",
	"color", "red",
	"background", "yellow",
	"padding", "1em",
	"border-radius", "0.4em",
	"top", "150px",
	"text-align", "center",
	"left", "350px",
	"transform", "rotate(-45deg);"
);

html_style(
	".html-element-parent", 
	"position", "absolute",
	"top", "0"
);

