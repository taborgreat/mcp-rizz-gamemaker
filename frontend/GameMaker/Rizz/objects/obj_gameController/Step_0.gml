if (global.gameState != "playersInputting" || global.localPlayer.isSpectator) {
    // Exit input phase
    cleanup_input_form();
}

// Status text position and visibility
// Skip transition check until we have a real game state (avoids false "opened" on first frame)
var _curtains_closed = (!is_undefined(global.gameState))
    ? (global.gameState == "awaitingPlayers" || global.gameState == "countdown")
    : true;
if (_prev_curtains_closed != _curtains_closed) {
    if (!_curtains_closed) {
        // Curtains just opened — snap status text to top immediately
        status_room_y  = 25;
        status_gui_y   = 80;
        status_visible = true;
    } else {
        // Curtains just closed — hide for 0.3 s then reappear centered
        status_visible    = false;
        status_hide_timer = round(0.3 * game_get_speed(gamespeed_fps));
    }
    _prev_curtains_closed = _curtains_closed;
}

if (status_hide_timer > 0) {
    status_hide_timer--;
    if (status_hide_timer == 0) {
        status_visible = true;
        status_room_y  = room_height / 2;
        status_gui_y   = display_get_gui_height() / 2;
    }
}