/// @function gmcallback_handleWebSocketMessage(rawJson)
/// @desc Called from JS bridge when data arrives
function gmcallback_handleWebSocketMessage(rawJson) {
    if (is_undefined(rawJson)) exit;

    show_debug_message("Received from JS: " + string(rawJson));
    var msg = json_parse(rawJson);
    if (is_undefined(msg) || is_undefined(msg.action)) exit;

    var action = msg.action;

    switch (action) {
        case "worldUpdate": {
            // Store the world object globally so your controller can access it
            global.world = msg.world;
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
            break;
        }

        case "playerSpeakingTick": {
            global.currentSpeaker = msg.params.currentSpeaker;
            global.timeLeft = msg.params.timeLeft;
            global.statusText = global.currentSpeaker + " is speaking... (" + string(global.timeLeft) + ")";
            break;
        }

        case "playerJoined": {
            show_debug_message("Player joined: " + msg.params.name);

            // Store local player info globally
            global.localPlayer = {
                name: msg.params.name
            };

            // Move to main room after join confirmation
		
            room_goto(rm_MainRoom);
            break; // ✅ this was missing
        }

        case "playerLeft": {
            show_debug_message("Player left: " + msg.params.name);
            break;
        }

        default:
            show_debug_message("Unrecognized action: " + string(action));
    }
}
