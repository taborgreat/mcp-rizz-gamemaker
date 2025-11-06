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

		    show_debug_message("Girl update → X:" + string(newX) + " Y:" + string(newY) + " Dest:" + string(destination) + " Name:" + string(girlName));

		    if (instance_exists(obj_girl)) {
		        obj_girl.x = newX;
		        obj_girl.y = newY;
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
			
			
			global.currentRoomId = msg.params.gameRoomId;
	
			
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
		
		case "roomFull": {
		    var o;
		    if (instance_exists(obj_RoomsAlertMessage)) {
		        o = instance_find(obj_RoomsAlertMessage, 0);
		    } else {
		        o = instance_create_layer(room_width / 2, room_height / 2, "Instances", obj_RoomsAlertMessage);
		    }
		    o.text = "That room is full!";
		    o.alarm[0] = room_speed * 3; 
		    break;
		}

		case "allRoomsFull": {
		    var o;
		    if (instance_exists(obj_RoomsAlertMessage)) {
		        o = instance_find(obj_RoomsAlertMessage, 0);
		    } else {
		        o = instance_create_layer(room_width / 2, room_height / 2, "Instances", obj_RoomsAlertMessage);
		    }
		    o.text = "All rooms are full! Try again later.";
		    o.alarm[0] = room_speed * 3; 
		    break;
		}


        default:
            show_debug_messagae("Unrecognized action: " + string(action));
    }
}
