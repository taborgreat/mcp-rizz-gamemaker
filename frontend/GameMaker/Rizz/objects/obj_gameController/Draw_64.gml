draw_set_font(fnt_big);
draw_set_halign(fa_center);
draw_set_valign(fa_middle);

draw_set_color(c_olive);

var xpos = display_get_gui_width() / 2;

if (global.statusText != undefined && status_visible) {
    draw_text_transformed(xpos, status_gui_y, global.statusText, 2, 2, 0);
}

