
var col;
if (remaining > 100) {
    col = c_lime;
}
else if (remaining > 60) {
    col = c_yellow;
}
else if (remaining > 30) {
    col = make_color_rgb(255, 165, 0);
}
else if (remaining > 10) {
    col = c_red;
}
else {
    col = make_color_rgb(139, 0, 0);
}


draw_set_color(col);
draw_text(20, 100,
    string(remaining) + " characters left");
draw_set_color(c_white); 
