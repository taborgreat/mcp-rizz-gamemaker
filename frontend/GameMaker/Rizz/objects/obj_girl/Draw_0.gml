var s = global.gameState;


var shadow_ok =
    (s == "playersInputting") ||
    (s == "awaitingPlayers") ||
    (s == "countdown");


if (shadow_ok) {
    draw_sprite(spr_slot, 0, x, y);
}


draw_self();
