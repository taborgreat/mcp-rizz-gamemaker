var text = "What's your name, bro?: " + name_input;
var x_center = 1920 / 2;
var y_center = 1080 / 2;


draw_set_halign(fa_center);
draw_set_valign(fa_middle);

draw_set_font(fnt_big);
draw_text(x_center, y_center, text);
