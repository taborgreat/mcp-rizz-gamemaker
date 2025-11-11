
draw_set_color(c_white);



if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
        draw_text_transformed(x*4-100, y*4, string(speaker) + ": " + string(text), 1, 1, 0);
    }
}
