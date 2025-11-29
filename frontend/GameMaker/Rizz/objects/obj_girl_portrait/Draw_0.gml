if (!is_array(global.girlStyle) || array_length(global.girlStyle) < 3) {

    draw_sprite(spr_portrait_background, 0, x, y);
    exit;
}
if (is_undefined(global.girlEmotion)) {
    global.girlEmotion = "neutral"; 
}

var body_sprite   = asset_get_index("spr_girl_head_"   + string(global.girlStyle[0]));
var hair_sprite   = asset_get_index("spr_girl_hair_"   + string(global.girlStyle[1]));
var outfit_sprite = asset_get_index("spr_girl_body_" + string(global.girlStyle[2]));
var emotion_sprite = asset_get_index("spr_girl_emotion_" + global.girlEmotion);


if (global.gameState != "girlMoving" &&
    global.gameState != "playersInputting" &&
    global.gameState != "awaitingPlayers" &&
	global.gameState != "preparingPlayerSpeaking" &&
    global.gameState != "countdown")
{
    draw_sprite(spr_portrait_background, 0, x, y);
    draw_sprite(body_sprite, 0, x, y);
    draw_sprite(outfit_sprite, 0, x, y);
    draw_sprite(hair_sprite, 0, x, y);
    draw_sprite(emotion_sprite, 0, x, y);
}
