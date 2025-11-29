if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
		
	
	//delay text until prompt is full size
	if (instance_exists(bg)) {
    if (bg.image_yscale < (bg.target_yscale * 0.95)) exit;
}

		

        draw_set_color(c_white);
        draw_set_halign(fa_left);

        var partial = string_copy(full_text, 1, visible_chars);

        var wrap_width = 800;
        var line_sep = 50;
		
		var xpos = 104 * 4; //multiplied by 4 to match 1080p scale 
		var ypos = 208 * 4;
		
        draw_text_ext(xpos, ypos, speaker + ": " + partial, line_sep, wrap_width);
    }
}
