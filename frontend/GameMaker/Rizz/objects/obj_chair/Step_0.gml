var occ_exists = (occupant != noone && instance_exists(occupant));
var lp_exists = is_struct(global.localPlayer);

if (!occ_exists || !lp_exists) {
    visible = false;
    exit;
}

if (global.gameState == "girlSpeaking") {
    visible = true;
    exit;
}

if (global.gameState == "girlMoving") {
    visible = false;
    exit;
}

if (global.gameState == "playerSpeaking") {
    visible = (occupant.name != global.currentSpeaker);
    exit;
}

visible = true;

if (
    occ_exists &&
    lp_exists &&
    occupant.name == global.localPlayer.name &&
    !global.localPlayer.isSpectator
) {

    if (!instance_exists(obj_local_player_pointer)) {
        var p = instance_create_layer(x, y - 45, "Instances", obj_local_player_pointer);
        p.parent_chair = id;
    } else {
        with (obj_local_player_pointer) {
            if (parent_chair == other.id) {
                x = other.x;
                y = other.y - 45;
            }
        }
    }
}
else {
    if (instance_exists(obj_local_player_pointer)) {
        with (obj_local_player_pointer) {
            if (parent_chair == other.id) {
                instance_destroy();
            }
        }
    }
}
