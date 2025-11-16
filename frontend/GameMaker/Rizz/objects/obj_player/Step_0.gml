if (name == global.localPlayer.name) {


    if (instance_exists(obj_curtain_left) && obj_curtain_left.state == "open") {


        if (!instance_exists(obj_local_player_pointer)) {
            instance_create_layer(x, y - 32, "Instances", obj_local_player_pointer);
        }

    }
}
