
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
target_xscale = 1.125; // overridden each frame in Draw_0 based on game state
target_yscale = 0.8;

// Status text position and visibility
// Room-draw y for the box sprite; GUI-draw y for the text label
// Both start centered (awaiting players is the initial state)
status_room_y  = room_height / 2;
status_gui_y   = display_get_gui_height() / 2;
status_visible = true;
status_hide_timer = 0;
_prev_curtains_closed = true;