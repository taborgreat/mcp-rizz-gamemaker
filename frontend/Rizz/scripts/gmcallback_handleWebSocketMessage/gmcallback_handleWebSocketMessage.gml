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
			global.playerLatestMessage = msg.params.latestMessage;
            global.timeLeft = msg.params.timeLeft;
            global.statusText = global.currentSpeaker + " is speaking... (" + string(global.timeLeft) + ")";
	
           
			
		       if (!instance_exists(obj_playerSpeaking)) {
		        var o = instance_create_layer(200, 200, "Instances", obj_playerSpeaking);
		        o.speaker = global.currentSpeaker;
		        o.text = global.playerLatestMessage;
		    } else {
		        with (obj_playerSpeaking) {
		            speaker = global.currentSpeaker;
		            text = global.playerLatestMessage;
		        }
		    }
		   
		    
			
            break;

        }
		 case "girlSpeaking": {
            global.girlMessage = msg.params.girlMessage;
            global.statusText = "The girl is speaking...";

            if (!instance_exists(obj_girlSpeaking)) {
                var g = instance_create_layer(400, 200, "Instances", obj_girlSpeaking);
                g.speaker = "Girl";
                g.text = global.girlMessage;
            } else {
                with (obj_girlSpeaking) {
                    speaker = "Girl";
                    text = global.girlMessage;
                }
            }

            break;
        }
		        case "updateGirl": {
            var newX = msg.params.x;
            var newY = msg.params.y;
            var destination = msg.params.destination; // optional: "stay", "center", or player name

            show_debug_message("Girl moving to " + string(newX) + ", " + string(newY) + " (" + string(destination) + ")");

            if (instance_exists(obj_girl)) {
                with (obj_girl) {
                    x = newX;
                    y = newY;
                    currentDestination = destination; // optional tracking variable
                }
            } else {
                var g = instance_create_layer(newX, newY, "Instances", obj_girl);
                g.currentDestination = destination;
            }

            break;
        }


        case "playerJoined": {
            show_debug_message("Player joined: " + msg.params.name);

         
            global.localPlayer = {
                name: msg.params.name
            };

           
		
            room_goto(rm_MainRoom);
            break; 
        }

        case "playerLeft": {
            show_debug_message("Player left: " + msg.params.name);
            break;
        }

        default:
            show_debug_message("Unrecognized action: " + string(action));
    }
}
