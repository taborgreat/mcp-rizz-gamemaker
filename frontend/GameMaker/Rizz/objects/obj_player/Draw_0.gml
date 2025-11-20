//spotlight
if (name == global.currentSpeaker && global.gameState=="playerSpeaking") {
    draw_sprite(spr_spotlight, 0, x, y);

}

//draw player sprite
draw_sprite_ext(sprite_index, image_index, x, y, xscale, yscale, image_angle, c_white, 1)

