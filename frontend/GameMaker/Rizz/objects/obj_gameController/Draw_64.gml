draw_set_halign(fa_left);
draw_set_valign(fa_top);
draw_text(40, 50, global.statusText);
draw_text(40, 150, "Your player: " + string(global.localPlayer.name));
draw_text(40, 280, "Room: " + string(global.currentRoomId));
