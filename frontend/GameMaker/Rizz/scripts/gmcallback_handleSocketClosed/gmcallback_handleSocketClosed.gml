	/// @function gmcallback_handleSocketClosed(rawJson)
	/// @desc Called from JS bridge when WebSocket connection closes
	function gmcallback_handleSocketClosed(rawJson) {
		
	    var reason = "Lost connection";
	    var msg = undefined;
    
   
	    if (!is_undefined(rawJson)) {
	        msg = json_parse(rawJson);
	        if (is_struct(msg) && variable_struct_exists(msg, "reason")) {
	            reason = msg.reason;
	        }
	    }


	    cleanup_input_form();


	  

	    global.world = undefined;
	    global.gameState = undefined;
	    global.timeLeft = undefined;
	    global.statusText = undefined;
	    global.currentSpeaker = undefined;
	    global.playerLatestMessage = undefined;
	    global.girlMessage = undefined;
	    global.girlName = undefined;
	    global.currentRoomId = undefined;
	    global.localPlayer = undefined;



	    global.connectionLostMessage =  reason;
		global.isJoiningGame = false;

    var o = instance_find(obj_gameController, 0);
o.alarm[1] = room_speed * 1.4;
with (obj_curtain_left) state = "closing";
with (obj_curtain_right) state = "closing";

	   
		  if (variable_global_exists("html_name_wrapper") && global.html_name_wrapper == undefined) {
	        html_init("HTML5Elements");
	    }
	}
