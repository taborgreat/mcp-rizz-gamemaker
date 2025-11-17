
global.chairs = [];

with (obj_chair) {
    array_push(global.chairs, id);
}



alarm[0] = game_get_speed(gamespeed_fps)/3;

var w = room_width*4;
var h = room_height*4;
display_set_gui_size(w, h);
