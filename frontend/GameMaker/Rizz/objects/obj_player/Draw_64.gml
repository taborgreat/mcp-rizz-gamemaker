draw_set_halign(fa_center);
draw_set_valign(fa_middle);

//scale by 4 for text resolution 


if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
      //shadow
draw_set_color(c_black);
draw_text(x * 4 + 3, (y + 20) * 4 + 4, name);

draw_set_color(c_white);
draw_text(x * 4, (y + 20) * 4, name);

    }
}
