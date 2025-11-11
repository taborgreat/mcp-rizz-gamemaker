with (obj_curtain_left) state = "opening";
with (obj_curtain_right) state = "opening";
if (variable_global_exists("world") && !is_undefined(global.world)) {
    update_world_state(global.world);
}

