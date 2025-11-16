/// @function update_world_state(world)
/// @desc Applies the latest world data to GameMaker visuals
function update_world_state(world) {
    //--------------------------------------------
    // 0. Track previous and current game state
    //--------------------------------------------
    if (variable_global_exists("gameState")) {
        global.prevGameState = global.gameState;
    } else {
        global.prevGameState = undefined;
    }

    // Patch only the fields we care about to avoid wholesale struct replacement
    if (!variable_global_exists("gameState") || is_undefined(global.gameState)) {
        global.gameState = undefined;
    }
    if (variable_struct_exists(world, "gameState")) {
        global.gameState = world.gameState;
    }

    var state = global.gameState;

    //--------------------------------------------
    // 1. Players / Chairs
    //--------------------------------------------
    // chairs is expected to be an array of chair descriptors that include x,y and occupant reference
    for (var i = 0; i < array_length(global.chairs); i++) {
        var chair = global.chairs[i];
        var playerForSlot = find_player_by_slot(i + 1);

        if (playerForSlot != undefined) {
            // If there's no occupant, create one
            if (!instance_exists(chair.occupant) || chair.occupant == noone) {
                chair.occupant = instance_create_layer(chair.x, chair.y, "Players", obj_player);
                chair.occupant.name = playerForSlot.name;

                switch (i + 1) {
                    case 1: chair.occupant.sprite_index = spr_player_1; break;
                    case 2: chair.occupant.sprite_index = spr_player_2; break;
                    case 3: chair.occupant.sprite_index = spr_player_3; break;
                    case 4: chair.occupant.sprite_index = spr_player_4; break;
                }
            } else {
                // If occupant exists, only update the name (and recreate only if the identity changed)
                if (chair.occupant.name != playerForSlot.name) {
                    // Replace occupant only when the player actually changed
                    var oldOcc = chair.occupant;
                    instance_destroy(oldOcc);
                    chair.occupant = instance_create_layer(chair.x, chair.y, "Players", obj_player);
                    chair.occupant.name = playerForSlot.name;
                    switch (i + 1) {
                        case 1: chair.occupant.sprite_index = spr_player_1; break;
                        case 2: chair.occupant.sprite_index = spr_player_2; break;
                        case 3: chair.occupant.sprite_index = spr_player_3; break;
                        case 4: chair.occupant.sprite_index = spr_player_4; break;
                    }
                } else {
                    // same player, just update fields we care about
                    chair.occupant.name = playerForSlot.name;
                }
            }
        } else {
            // Only destroy occupant when no player is present and an occupant exists.
            if (instance_exists(chair.occupant) && chair.occupant != noone) {
                instance_destroy(chair.occupant);
                chair.occupant = noone;
            }
        }
    }

    //--------------------------------------------
    // 2. Girl position
    //--------------------------------------------
    if (variable_struct_exists(world, "girl") && instance_exists(obj_girl)) {
        // Only patch girl values — avoid creating/destroying the girl instance here
        obj_girl.target_x = world.girl.x;
        obj_girl.target_y = world.girl.y;
        obj_girl.girlName = world.girl.name;
        global.girlName = world.girl.name;
    }

    //--------------------------------------------
    // 3. Visual indicators / HUD messages
    // Use prevGameState to avoid repeated destroy/create churn
    //--------------------------------------------
    switch (state) {
        case "awaitingPlayers":
            global.statusText = "Waiting for more players...";
            // Only destroy if we actually left the previous "playerSpeaking" or "girlSpeaking" state
            if (global.prevGameState != state) {
                if (instance_exists(obj_playerSpeaking)) instance_destroy(obj_playerSpeaking);
                if (instance_exists(obj_girlSpeaking)) instance_destroy(obj_girlSpeaking);
            }
            break;

        case "countdown":
            global.statusText = "Game starting in " + string(global.timeLeft);
            break;

        case "playersInputting":
            global.statusText = "Players are typing... (" + string(global.timeLeft) + ")";
            // Create input objects only when we actually enter this state
            if (global.prevGameState != "playersInputting") {
                if (!instance_exists(obj_playerMessageInput))
                    instance_create_layer(0, 0, "Instances", obj_playerMessageInput);
                if (!instance_exists(obj_playerMessageRemaining))
                    instance_create_layer(0, 0, "Instances", obj_playerMessageRemaining);
            }
            break;

        case "playerSpeaking":
            global.statusText = global.currentSpeaker + " is speaking... (" + string(global.timeLeft) + ")";
            // Don't destroy playerMessageRemaining repeatedly — only when leaving the state
            if (global.prevGameState != state) {
                if (instance_exists(obj_playerMessageRemaining)) instance_destroy(obj_playerMessageRemaining);
            }
            break;

        case "girlSpeaking":
            global.statusText = "The girl is speaking...";
            if (global.prevGameState != state) {
                if (instance_exists(obj_playerSpeaking)) instance_destroy(obj_playerSpeaking);
            }
            break;

        case "girlMoving":
            global.statusText = "The girl is moving...";
            if (global.prevGameState != state) {
                if (instance_exists(obj_girlSpeaking)) instance_destroy(obj_girlSpeaking);
            }
            break;
    }

    //--------------------------------------------
    // 4. Handle transitions after visuals update
    // Already guarded by prevGameState checks above
    //--------------------------------------------
    // (No additional code needed; creation/destruction performed above only on transitions)
}

function find_player_by_slot(slot) {
    var players = global.world.players;
    if (is_undefined(players)) return undefined;

    for (var i = 0; i < array_length(players); i++) {
        if (players[i].slot == slot) {
            return players[i];
        }
    }
    return undefined;
}