

if (!is_array(global.girlStyle) || array_length(global.girlStyle) < 3) {
    exit;
}
if (is_undefined(global.girlEmotion)) {
    global.girlEmotion = "neutral"; 
}


var hair_sprite   = asset_get_index("spr_m_girl_hair_"   + string(global.girlStyle[1]));
var outfit_sprite = asset_get_index("spr_m_girl_body_" + string(global.girlStyle[2]));



    draw_sprite(outfit_sprite, 0, x, y);
    draw_sprite(hair_sprite, 0, x, y);
