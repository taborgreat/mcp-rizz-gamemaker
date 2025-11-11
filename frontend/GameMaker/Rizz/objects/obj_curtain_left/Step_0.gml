
switch (state) {
    case "opening":
        x = lerp(x, open_x, 0.05);
        y = lerp(y, open_y, 0.05);
        if (abs(x - open_x) < 1 && abs(y - open_y) < 1) {
            x = open_x;
            y = open_y;
            state = "open";
        }
        break;

    case "closing":
        x = lerp(x, closed_x, 0.05);
        y = lerp(y, closed_y, 0.05);
        if (abs(x - closed_x) < 1 && abs(y - closed_y) < 1) {
            x = closed_x;
            y = closed_y;
            state = "closed";
        }
        break;
}
