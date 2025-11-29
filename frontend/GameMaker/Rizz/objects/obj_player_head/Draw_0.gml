//draw background
draw_sprite(spr_portrait_background, 0, x, y);

//draw head
var x_center = x;
var y_center = y;

draw_sprite(asset_get_index("spr_player_head_" + string(global.playerHead)), 0, x, y);

//draw_shirt
draw_sprite(spr_player_shirtless, 0, x, y);

