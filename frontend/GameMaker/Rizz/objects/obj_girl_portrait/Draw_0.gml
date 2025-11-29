if (!is_array(global.girlStyle) || array_length(global.girlStyle) < 3) {

    draw_sprite(spr_portrait_background, 0, x, y);
    exit;
}
if (is_undefined(global.girlEmotion)) {
    global.girlEmotion = "neutral"; 
}

//need to shift back array server side
var hair_sprite   = asset_get_index("spr_girl_hair_"   + string(global.girlStyle[1]));
var body_sprite = asset_get_index("spr_girl_body_" + string(global.girlStyle[2]));
var emotion_sprite = asset_get_index("spr_girl_emotion_" + global.girlEmotion);


if (hair_sprite    == -1) hair_sprite    = spr_girl_hair_0;
if (body_sprite  == -1) body_sprite  = spr_girl_body_0;
if (emotion_sprite == -1) emotion_sprite = spr_girl_emotion_neutral;

if (global.gameState != "girlMoving" &&
    global.gameState != "playersInputting" &&
    global.gameState != "awaitingPlayers" &&
	global.gameState != "preparingPlayerSpeaking" &&
    global.gameState != "countdown")
{
    draw_sprite(spr_portrait_background, 0, x, y);
    draw_sprite(body_sprite, 0, x, y);
    draw_sprite(hair_sprite, 0, x, y);
    draw_sprite(emotion_sprite, 0, x, y);
}
