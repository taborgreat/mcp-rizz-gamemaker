// Safety check - don't proceed if data not ready
if (!variable_global_exists("players") || !variable_global_exists("girl")) {
    show_debug_message("Warning: Global data not ready yet");
    instance_destroy();
    exit;
}


// Draw girl
draw_set_color(c_fuchsia);
draw_circle(girl.x, girl.y, 10, false);

// Draw players
draw_set_color(c_aqua);
for (var i = 0; i < array_length(players); i++) {
    var p = players[i];
    draw_text(p.x, p.y - 16, p.name);
    draw_circle(p.x, p.y, 8, false);
}
