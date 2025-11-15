

var speaker = obj_girl;
if (speaker != noone) {
    var spr = speaker.sprite_index;
    var frame = speaker.image_index;
	  draw_sprite(spr_star, frame, x+320, y-10); // adjust offset
	draw_sprite(spr, frame, x+320, y-10); // adjust offset
  

}

draw_self();
