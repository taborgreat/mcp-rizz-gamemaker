


if (speaker_style != undefined) {

    var head_i  = speaker_style[0];
    var face_i  = speaker_style[1];
    var mouth_i = speaker_style[2];
	
	var spr_shirt = asset_get_index("spr_player_shirt_" + string(speaker_slot));
    var spr_head  = asset_get_index("spr_player_head_"  + string(head_i));
    var spr_face  = asset_get_index("spr_player_face_"  + string(face_i));
    var spr_mouth = asset_get_index("spr_player_mouth_" + string(mouth_i));

    // Fallback if sprite doesn't exist
    if (spr_head  == -1) spr_head  = spr_player_head_0;
    if (spr_face  == -1) spr_face  = spr_player_face_0;
    if (spr_mouth == -1) spr_mouth = spr_player_mouth_0;
	if (spr_shirt == -1) spr_shirt = spr_player_shirt_1; //needs to match slot


    // Draw the layers
	draw_sprite(spr_portrait_background, 0,x,y);
    draw_sprite(spr_head, 0, x, y);
    draw_sprite(spr_face, 0, x, y);
    draw_sprite(spr_mouth, 0, x, y);
	draw_sprite(spr_shirt, 0, x, y);
}