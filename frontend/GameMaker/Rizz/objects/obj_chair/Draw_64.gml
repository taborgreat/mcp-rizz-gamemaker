draw_self();
draw_set_color(make_color_rgb(200, 200, 200));



if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
		draw_set_alpha(0.6);
		draw_text(x*4, y*4 +110, string(slot));
        draw_set_alpha(1);
    }
}



