//player
if (variable_global_exists("currentSpeakerSlot")) {
    var slot = global.currentSpeakerSlot;
    var valid_slot = (slot > 0 && slot <= array_length(global.chairs));

    if (valid_slot && global.gameState == "playerSpeaking") {
        spot1.visible = true;
        var chair = global.chairs[slot - 1];
        spot1_target_x = chair.x;
        spot1_target_y = chair.y;
    } else {
        spot1.visible = false;
    }

} else {
    spot1.visible = false;
}


// girl
if (instance_exists(obj_girl) && global.gameState!="awaitingPlayers" && global.gameState!="countdown")
{
    spot2_target_x = obj_girl.x;
    spot2_target_y = obj_girl.y;
	spot2.visible = true;
} else {
	spot2.visible = false;	
}

with (spot1) {
    target_x = other.spot1_target_x;
    target_y = other.spot1_target_y;
}

with (spot2) {
    target_x = other.spot2_target_x;
    target_y = other.spot2_target_y;
}
