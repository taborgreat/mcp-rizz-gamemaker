var s = global.gameState;


var shadow_ok =
  
    (s == "awaitingPlayers") ||
    (s == "countdown");


if (shadow_ok) {
    draw_sprite(spr_slot, 0, x, y);
}

if(!shadow_ok) {

    draw_sprite(spr_spotlight, 0, x, y);
	
	
}


draw_self();
