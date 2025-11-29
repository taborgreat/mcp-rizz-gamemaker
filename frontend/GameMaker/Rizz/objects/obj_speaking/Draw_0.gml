


if (speaker_style != undefined) {

    var head_i  = speaker_style[0];
    var face_i  = speaker_style[1];
    var mouth_i = speaker_style[2];
	
	var spr_shirt = asset_get_index("spr_player_shirt_" + string(speaker_slot));
    var spr_head  = asset_get_index("spr_player_head_"  + string(head_i));
    var spr_face  = asset_get_index("spr_player_face_"  + string(face_i));
    var spr_mouth = asset_get_index("spr_player_mouth_" + string(mouth_i));
	var spr_mouth_open = asset_get_index("spr_player_mouth_" + string(mouth_i) + "_open");

    // Fallback if sprite doesn't exist
    if (spr_head  == -1) spr_head  = spr_player_head_0;
    if (spr_face  == -1) spr_face  = spr_player_face_0;
    if (spr_mouth == -1) spr_mouth = spr_player_mouth_0;
	if (spr_mouth == -1) spr_mouth = spr_player_mouth_0_open;
	if (spr_shirt == -1) spr_shirt = spr_player_shirt_1; //needs to match slot

	var spr_mouth_final = spr_mouth;

// only animate mouth when not the girl and text is being revealed
	if (speaker != global.girlName 
	&& string_length(full_text) >= visible_chars
	&& full_text != "Player missed their turn")
	{
	    spr_mouth_final = mouth_opened ? spr_mouth_open : spr_mouth;
}

    // Draw the layers
	draw_sprite(spr_portrait_background, 0,x,y);
    draw_sprite(spr_head, 0, x, y);
    draw_sprite(spr_face, 0, x, y);
    draw_sprite(spr_mouth_final, 0, x, y);
	draw_sprite(spr_shirt, 0, x, y);
}