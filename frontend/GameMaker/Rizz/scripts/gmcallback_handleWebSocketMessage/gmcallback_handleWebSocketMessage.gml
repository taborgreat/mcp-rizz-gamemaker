/// @function gmcallback_handleWebSocketMessage(rawJson)
/// @desc Called from JS bridge when data arrives
function gmcallback_handleWebSocketMessage(rawJson) {
    if (is_undefined(rawJson)) exit;


    var msg = json_parse(rawJson);
    if (is_undefined(msg) || is_undefined(msg.action)) exit;

    var action = msg.action;
	

    switch (action) {

        case "worldUpdate": {
           
            var prevState = undefined;
            if (variable_global_exists("world") && is_struct(global.world)) {
                if (variable_struct_exists(global.world, "gameState"))
                    prevState = global.world.gameState;
            }

            global.world = msg.world;
            var state = global.world.gameState;

          

            if (instance_exists(obj_gameController)) {
                with (obj_gameController) {
                    update_world_state(global.world);
                }
            }
			
			
           var lp = undefined;
    var players = global.world.players;

    for (var i = 0; i < array_length(players); i++) {
        if (players[i].name == global.localPlayer.name) {
            lp = players[i];
            break;
        }
    }

    if (lp != undefined) {
    global.localPlayer.isSpectator = lp.isSpectator;
} else {
    global.localPlayer.isSpectator = false;
}






    if (instance_exists(obj_gameController)) {
        with (obj_gameController) {
            update_world_state(global.world);
        }
    }
    break;
			
			
        }

        case "countdownTick": {
            global.timeLeft = msg.params.timeLeft;
            global.statusText = "Game starting in " + string(global.timeLeft);
            break;
        }

        case "playersInputtingTick": {
            global.timeLeft = msg.params.timeLeft;
            global.statusText = "Players are typing... (" + string(global.timeLeft) + ")";

            if (global.timeLeft <= 0) {
                cleanup_input_form();
            }
            break;
        }

case "playerSpeakingTick": {
    global.currentSpeaker = msg.params.currentSpeaker;
    global.playerLatestMessage = msg.params.latestMessage;
    global.timeLeft = msg.params.timeLeft;

    if (!instance_exists(obj_playerSpeaking)) {
        var o = instance_create_layer(200, 200, "Instances", obj_playerSpeaking);
        o.speaker = global.currentSpeaker;
        o.full_text = global.playerLatestMessage;
        o.visible_chars = 0;
        o.char_timer = 0;
        o.last_timeleft = global.timeLeft;
    } else {
        with (obj_playerSpeaking) {
            speaker = global.currentSpeaker;

            // MESSAGE CHANGED
            if (full_text != global.playerLatestMessage) {
                full_text = global.playerLatestMessage;
                visible_chars = 0;
                char_timer = 0;
            }

            // NEW SPEAKING ROUND (timeLeft jumped up)
            if (global.timeLeft > last_timeleft) {
                visible_chars = 0;
                char_timer = 0;
            }

            last_timeleft = global.timeLeft;
        }
    }
}
break;



        case "girlSpeaking": {
            global.girlMessage = msg.params.girlMessage;
            global.statusText = "The girl is speaking...";

            if (!instance_exists(obj_girlSpeaking)) {
                var g = instance_create_layer(400, 200, "Instances", obj_girlSpeaking);
                g.speaker = global.girlName;
                g.text = global.girlMessage;
            } else {
                with (obj_girlSpeaking) {
                    speaker = global.girlName;
                    text = global.girlMessage;
                }
            }
            break;
        }

        case "updateGirl": {
            var newX = msg.params.x;
            var newY = msg.params.y;
            var destination = msg.params.destination;
            var girlName = msg.params.name;

          

            if (instance_exists(obj_girl)) {
                obj_girl.target_x = newX;
                obj_girl.target_y = newY;
                obj_girl.currentDestination = destination;
                obj_girl.girlName = girlName;
            }
            break;
        }

        case "playerJoined": {
            show_debug_message("Player joined: " + msg.params.name);

            if (variable_global_exists("html_name_form") && global.html_name_form != undefined) {
                html_element_cleanup(global.html_name_form, true);
                global.html_name_form = undefined;
            }

            if (variable_global_exists("html_name_wrapper") && global.html_name_wrapper != undefined) {
                html_element_cleanup(global.html_name_wrapper, true);
                global.html_name_wrapper = undefined;
            }
			


			//set player settings
			
            global.currentRoomId = msg.params.gameRoomId;
            global.localPlayer = { name: msg.params.name };

            room_goto(rm_MainRoom);
			global.isJoiningGame = false;
            break;
        }

        case "playerLeft": {
            show_debug_message("Player left: " + msg.params.name);
            break;
        }


        default: {
            show_debug_message("Unrecognized action: " + string(action));
            break;
        }
    }
}
