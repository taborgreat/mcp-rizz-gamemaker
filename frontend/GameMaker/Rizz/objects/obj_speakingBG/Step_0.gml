var x_pos_player = 64;
var x_pos_girl = 416;
var y_pos = 168;

var start_scale = 0.66;


if (girlSpeaking) {
    image_xscale = lerp(image_xscale, -target_xscale, 0.1);
	image_yscale = lerp(image_yscale, target_yscale, 0.1);	
	
	if x != x_pos_girl {
		image_xscale = -start_scale; //reset size and flip image
		image_yscale = start_scale; 
		x = x_pos_girl; 
		y = y_pos; 
	}
} else {
	image_xscale = lerp(image_xscale, target_xscale, 0.1);
	image_yscale = lerp(image_yscale, target_yscale, 0.1);
	if x != x_pos_player {
		image_xscale = start_scale; //reset size and flip back to default
		image_yscale = start_scale;
		x = x_pos_player;
		y = y_pos;
	}
}
