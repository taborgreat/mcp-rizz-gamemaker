



if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
		
draw_set_color(c_white);
	
		draw_text(x*4, y*4, string(speaker) + ": " + string(text));
    }
}
