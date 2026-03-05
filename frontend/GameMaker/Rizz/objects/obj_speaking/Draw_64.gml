if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
		
	
	//delay text until prompt is full size
	if (instance_exists(bg)) {
    if (bg.image_yscale < (bg.target_yscale * 0.95)) exit;
}

		

        draw_set_color(c_white);
        draw_set_halign(fa_left);
        draw_set_valign(fa_top);

        var partial = string_copy(full_text, 1, visible_chars);

        var wrap_width = 800;
        var line_sep = 50;
        var max_lines = 4;

        var xpos = 104 * 4; //multiplied by 4 to match 1080p scale
        var ypos_base = 208 * 4;

        var full_str = speaker + ": " + partial;

        // Count rendered lines and scroll ypos up so newest text stays visible
        var line_count = string_height_ext(full_str, line_sep, wrap_width) / line_sep;
        line_count = max(1, round(line_count));

        var scroll_lines = max(0, line_count - max_lines);
        var ypos = ypos_base - scroll_lines * line_sep;

        draw_text_ext(xpos, ypos, full_str, line_sep, wrap_width);
    }
}
