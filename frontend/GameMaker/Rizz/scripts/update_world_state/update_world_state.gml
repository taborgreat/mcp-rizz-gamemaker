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

    global.gameState = world.gameState;
    var state = global.gameState;

    //--------------------------------------------
    // 1. Players
    //--------------------------------------------
    for (var i = 0; i < array_length(chairs); i++) {
        var chair = chairs[i];
        var playerForSlot = find_player_by_slot(i + 1);

        if (playerForSlot != undefined) {
            if (!instance_exists(chair.occupant)) {
                chair.occupant = instance_create_layer(chair.x, chair.y, "Instances", obj_player);
                chair.occupant.name = playerForSlot.name;
				   switch (i + 1) {
            case 1: chair.occupant.sprite_index = spr_player_1; break;
            case 2: chair.occupant.sprite_index = spr_player_2; break;
            case 3: chair.occupant.sprite_index = spr_player_3; break;
            case 4: chair.occupant.sprite_index = spr_player_4; break;
        }
            } else {
                chair.occupant.name = playerForSlot.name;
            }
        } else if (instance_exists(chair.occupant)) {
            instance_destroy(chair.occupant);
            chair.occupant = noone;
        }
    }

    //--------------------------------------------
    // 2. Girl position
    //--------------------------------------------
    if (instance_exists(obj_girl)) {
        obj_girl.x = world.girl.x;
        obj_girl.y = world.girl.y;
        obj_girl.girlName = world.girl.name;
        global.girlName = world.girl.name;
    }

    //--------------------------------------------
    // 3. Visual indicators / HUD messages
    //--------------------------------------------
    switch (state) {
        case "awaitingPlayers":
            global.statusText = "Waiting for more players...";
            if (instance_exists(obj_playerSpeaking)) instance_destroy(obj_playerSpeaking);
            if (instance_exists(obj_girlSpeaking)) instance_destroy(obj_girlSpeaking);
            break;

        case "countdown":
            global.statusText = "Game starting in " + string(global.timeLeft);
            break;

        case "playersInputting":
            global.statusText = "Players are typing... (" + string(global.timeLeft) + ")";
            break;

        case "playerSpeaking":
		 if (instance_exists(obj_playerMessageRemaining)) instance_destroy(obj_playerMessageRemaining);
            global.statusText = global.currentSpeaker + " is speaking... (" + string(global.timeLeft) + ")";
           

            
            break;

        case "girlSpeaking":
            if (instance_exists(obj_playerSpeaking)) instance_destroy(obj_playerSpeaking);
            global.statusText = "The girl is speaking...";
            break;

        case "girlMoving":
            global.statusText = "The girl is moving...";
            if (instance_exists(obj_girlSpeaking)) instance_destroy(obj_girlSpeaking);
            break;
    }

    //--------------------------------------------
    // 4. Handle transitions after visuals update
    //--------------------------------------------
    if (global.prevGameState != "playersInputting" && global.gameState == "playersInputting") {
        // Enter input phase
        if (!instance_exists(obj_playerMessageInput))
            instance_create_layer(0, 0, "Instances", obj_playerMessageInput);
        if (!instance_exists(obj_playerMessageRemaining))
            instance_create_layer(0, 0, "Instances", obj_playerMessageRemaining);
    } 

   
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
