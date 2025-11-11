switch (state) {
    case "opening":
        x = lerp(x, open_x, 0.05);
        if (abs(x - open_x) < 1) {
            x = open_x;
            state = "open";
        }
        break;

    case "closing":
        x = lerp(x, closed_x, 0.05);
        if (abs(x - closed_x) < 1) {
            x = closed_x;
            state = "closed";
        }
        break;
}
