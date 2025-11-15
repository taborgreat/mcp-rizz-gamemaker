
draw_set_color(c_white);



if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
        draw_text_transformed(x*1.6, y*3.75, string(speaker) + ": " + string(text), 1, 1, 0);
    }
}
