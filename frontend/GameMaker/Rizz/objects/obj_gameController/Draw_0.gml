///draw animated timer background

// Box width varies by state: widest for awaitingPlayers, slightly wider for countdown, original for everything else
if (global.gameState == "awaitingPlayers") {
    target_xscale = 2.6;
} else if (global.gameState == "countdown") {
    target_xscale = 2;
} else {
    target_xscale = 0.9;
}

if (global.statusText != undefined && status_visible) {
    timer_xscale = lerp(timer_xscale, target_xscale, 0.1);
    timer_yscale = lerp(timer_yscale, target_yscale, 0.1);
    draw_sprite_ext(spr_textbox_generic, 0, room_width / 2, status_room_y, timer_xscale, timer_yscale, 0, c_white, 0.8);
} else {
    timer_xscale = start_scale;
    timer_yscale = start_scale;
}
