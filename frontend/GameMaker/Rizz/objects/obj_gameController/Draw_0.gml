///draw animated timer background
if (instance_exists(obj_curtain_left) && obj_curtain_left.state == "open") {
	if(global.statusText!= undefined) {
		timer_xscale = lerp(timer_xscale, target_xscale, 0.1);
		timer_yscale = lerp(timer_yscale, target_yscale, 0.1);
        draw_sprite_ext(spr_textbox_generic, 0, 240, 25, timer_xscale, timer_yscale, 0, c_white, 0.8)
    } else {
		timer_xscale = start_scale;
		timer_yscale = start_scale;
	}
}