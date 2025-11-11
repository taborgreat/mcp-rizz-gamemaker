draw_set_halign(fa_left);
draw_set_valign(fa_top);

if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
        draw_text(40, 50, global.statusText);
    }
}
