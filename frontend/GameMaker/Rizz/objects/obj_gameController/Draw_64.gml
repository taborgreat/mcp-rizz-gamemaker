draw_set_font(fnt_big);
draw_set_halign(fa_center);
draw_set_valign(fa_top);

draw_set_color(c_olive);

var xpos = display_get_gui_width() / 2;

if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
		if(global.statusText!= undefined){
        draw_text(xpos, 1020, global.statusText);
		}
    }
}
