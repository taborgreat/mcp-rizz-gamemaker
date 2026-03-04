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

    var _state = global.gameState;

    //--------------------------------------------
    // 1. Players / Chairs
    //--------------------------------------------
    // chairs is expected to be an array of chair descriptors that include x,y and occupant reference
    for (var i = 0; i < array_length(global.chairs); i++) {
        var chair = global.chairs[i];
        var playerForSlot = find_player_by_slot(i + 1);

        // Slots 0 and 3 enter from the left; slots 1 and 2 enter from the right
        var _enter_x = (i == 0 || i == 3) ? -150 : room_width + 150;

        // During girl entrance states no players are shown — clear any seated ones
        if (_state == "girlEntering" || _state == "girlIntro") {
            if (instance_exists(chair.occupant) && chair.occupant != noone) {
                var _occ = chair.occupant;
                if (_occ.walk_state != "walking_out") {
                    _occ.exit_x = (_occ.x < room_width / 2) ? -150 : room_width + 150;
                    _occ.walk_state = "walking_out";
                }
                chair.occupant = noone;
            }
            continue;
        }

        if (playerForSlot != undefined) {
            // If there's no seated occupant, walk one in from their assigned side
            if (!instance_exists(chair.occupant) || chair.occupant == noone) {
                chair.occupant = instance_create_layer(_enter_x, chair.y, "Players", obj_player);
                chair.occupant.target_x = chair.x;
                chair.occupant.target_y = chair.y;
                chair.occupant.walk_state = "walking_in";
                chair.occupant.name = playerForSlot.name;
                switch (i + 1) {
                    case 1: chair.occupant.sprite_index = spr_player_1; break;
                    case 2: chair.occupant.sprite_index = spr_player_2; break;
                    case 3: chair.occupant.sprite_index = spr_player_3; break;
                    case 4: chair.occupant.sprite_index = spr_player_4; break;
                }
            } else {
                if (chair.occupant.name != playerForSlot.name) {
                    // Different player in this slot — send the old one walking out,
                    // bring the new one walking in from their slot's assigned side (spectator exchange)
                    var _oldOcc = chair.occupant;
                    if (instance_exists(_oldOcc)) {
                        _oldOcc.exit_x = (_oldOcc.x < room_width / 2) ? -150 : room_width + 150;
                        _oldOcc.walk_state = "walking_out";
                    }
                    chair.occupant = instance_create_layer(_enter_x, chair.y, "Players", obj_player);
                    chair.occupant.target_x = chair.x;
                    chair.occupant.target_y = chair.y;
                    chair.occupant.walk_state = "walking_in";
                    chair.occupant.name = playerForSlot.name;
                    switch (i + 1) {
                        case 1: chair.occupant.sprite_index = spr_player_1; break;
                        case 2: chair.occupant.sprite_index = spr_player_2; break;
                        case 3: chair.occupant.sprite_index = spr_player_3; break;
                        case 4: chair.occupant.sprite_index = spr_player_4; break;
                    }
                } else {
                    // Same player — keep name in sync
                    chair.occupant.name = playerForSlot.name;
                }
            }
        } else {
            // No player for this slot — send occupant walking off-screen, then free the slot
            if (instance_exists(chair.occupant) && chair.occupant != noone) {
                var _occ = chair.occupant;
                if (_occ.walk_state != "walking_out") {
                    _occ.exit_x = (_occ.x < room_width / 2) ? -150 : room_width + 150;
                    _occ.walk_state = "walking_out";
                }
                // Free the chair immediately so a new arrival can fill it right away
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
		global.girlStyle = world.girl.style;
        global.girlEmotion = world.girl.emotion;
    }
    

    //--------------------------------------------
    // 3. Visual indicators / HUD messages
    // Use prevGameState to avoid repeated destroy/create churn
    //--------------------------------------------

    // Curtains: closed during awaitingPlayers/countdown, open for everything else
    if (global.prevGameState != _state) {
        var _curtains_closed = (_state == "awaitingPlayers" || _state == "countdown");
        with (obj_curtain_left)  state = _curtains_closed ? "closing" : "opening";
        with (obj_curtain_right) state = _curtains_closed ? "closing" : "opening";
    }

    switch (_state) {
        case "awaitingPlayers":
            global.statusText = "Waiting for more players...";
            // Only destroy if we actually left the previous "playerSpeaking" or "girlSpeaking" state
            if (global.prevGameState != _state) {
                if (instance_exists(obj_speaking)) instance_destroy(obj_speaking);
                if (instance_exists(obj_girlSpeaking)) instance_destroy(obj_girlSpeaking);
            }
            break;

        case "countdown":
            global.statusText = "Game starting in " + string(global.timeLeft);
            break;

        case "girlEntering":
            global.statusText = undefined;
            // Clean up any leftover speaking boxes when she walks on
            if (global.prevGameState != _state) {
                if (instance_exists(obj_speaking)) instance_destroy(obj_speaking);
            }
            break;

        case "girlIntro":
            global.statusText = undefined;
            // obj_speaking is created by the girlIntro message handler; do NOT destroy it here
            // because the first tick and the stateChange can arrive in the same frame, causing a flash
            break;

        case "playersInputting":

            // Create input objects only when we actually enter this state
            if (global.prevGameState != "playersInputting") {
                if (instance_exists(obj_speaking)) instance_destroy(obj_speaking);
                if (!instance_exists(obj_playerMessageInput))
                    instance_create_layer(0, 0, "Instances", obj_playerMessageInput);
                if (!instance_exists(obj_playerMessageRemaining))
                    instance_create_layer(0, 0, "Instances", obj_playerMessageRemaining);
            }
            break;

        case "playerSpeaking":
            global.statusText = undefined;
            // Don't destroy playerMessageRemaining repeatedly — only when leaving the state
            if (global.prevGameState != _state) {
                if (instance_exists(obj_playerMessageRemaining)) instance_destroy(obj_playerMessageRemaining);
            }
            break;

        case "girlSpeaking":
            global.statusText = undefined;
            if (global.prevGameState != _state) {
                if (instance_exists(obj_speaking)) instance_destroy(obj_speaking);
            }

            break;

        case "girlMoving":
            global.statusText = undefined;
            if (global.prevGameState != _state) {
                if (instance_exists(obj_speaking)) instance_destroy(obj_speaking);
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