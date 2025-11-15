

var speaker = get_speaker_instance();
if (speaker != noone) {
    var spr = speaker.sprite_index;
    var frame = speaker.image_index;
	 draw_sprite(spr_star, frame, x, y); 
    draw_sprite(spr, frame, x, y); 
}

draw_self(); 