
draw_self();


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

draw_set_color(c_white);
draw_text(x, y - sprite_get_height(sprite_index) / 2 - 20, thought);

if (variable_instance_exists(id, "girlName")) {
    draw_text(x, y - sprite_get_height(sprite_index) / 2 - 60, girlName);
}

