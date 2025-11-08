/// @function gmcallback_handleSocketClosed(rawJson)
/// @desc Called from JS bridge when WebSocket connection closes
function gmcallback_handleSocketClosed(rawJson) {

   
    var reason = "Lost connection";
    var msg = undefined;
    if (!is_undefined(rawJson)) {
        msg = json_parse(rawJson);
        if (!is_undefined(msg.reason)) reason = msg.reason;
    }

   cleanup_input_form();

	
	 if (variable_global_exists("html_name_wrapper") && global.html_name_wrapper == undefined) {
	html_init("HTML5Elements");

	 }
	 
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

        room_goto(rm_JoinRoom);
global.connectionLostMessage = "Connection failed";
            
		
    
}
