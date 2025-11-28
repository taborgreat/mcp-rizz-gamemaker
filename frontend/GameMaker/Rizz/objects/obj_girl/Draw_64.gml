
/*

var thought = "";

if (!variable_instance_exists(id, "currentDestination")) {
    currentDestination = "stay";
}

switch (string(currentDestination)) {
    case "stay":
        thought = "Thinking about... staying put";
        break;
    case "center":
        thought = "Thinking about... the center";
        break;
    default:
        thought = "Thinking about... " + string(currentDestination);
        break;
}


}



draw_set_color(c_white);
draw_text(x * 4, (y*4) - sprite_get_height(sprite_index) / 2 - 120, thought);

    }
}

*/

    

draw_set_halign(fa_center);
draw_set_valign(fa_middle);
if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {
       if (variable_instance_exists(id, "girlName")) {
//shadow
draw_set_color(c_black);
draw_text(x * 4 + 3, (y + 20) * 4 + 4, girlName);

draw_set_color(make_color_rgb(255, 190, 210));
draw_text(x * 4, (y + 20) * 4, girlName);
	   }
	}
}