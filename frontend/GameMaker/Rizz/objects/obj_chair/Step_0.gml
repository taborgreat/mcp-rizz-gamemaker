var occ_exists = (occupant != noone && instance_exists(occupant));

if (!occ_exists) {
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
