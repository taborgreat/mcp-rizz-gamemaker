if (walk_state == "walking_in") {
    // Ease into the target seat position
    x = lerp(x, target_x, 0.04);
    y = lerp(y, target_y, 0.04);
    if (point_distance(x, y, target_x, target_y) < 2) {
        x = target_x;
        y = target_y;
        walk_state = "idle";
    }
} else if (walk_state == "walking_out") {
    // March off-screen at constant speed then self-destruct
    x += sign(exit_x - x) * walk_spd;
    if (abs(x - exit_x) < walk_spd) {
        instance_destroy();
    }
} else {
    // idle: breathing animation
    xscale = sine_between((randomOffset+current_time/1000)+(breath_spd*0.75), breath_spd, 0.95, 1.05);
    yscale = sine_between(randomOffset+current_time/1000, breath_spd, 0.9, 1.1);
}