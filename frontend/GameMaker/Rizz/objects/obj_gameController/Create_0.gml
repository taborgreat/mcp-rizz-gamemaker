
global.chairs = [];

with (obj_slot) {
    array_push(global.chairs, id);
}



alarm[0] = game_get_speed(gamespeed_fps)/3;

var w = room_width*4;
var h = room_height*4;
display_set_gui_size(w, h);


//timer background settings
start_scale = 0.66;
timer_xscale = start_scale;
timer_yscale = start_scale;
target_xscale = 1.125;
target_yscale = 0.8;