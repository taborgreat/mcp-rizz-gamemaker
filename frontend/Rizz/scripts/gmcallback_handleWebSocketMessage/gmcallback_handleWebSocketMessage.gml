/// @function gmcallback_handleWebSocketMessage(rawJson)
/// @desc Called from JS bridge when data arrives
function gmcallback_handleWebSocketMessage(rawJson) {

    show_debug_message("Received from JS: " + string(rawJson));
	

    if (is_undefined(rawJson)) {
        show_debug_message("handleWebSocketMessage: rawJson undefined.");
        exit;
    }

    var msg = json_parse(rawJson);
    if (is_undefined(msg) || is_undefined(msg.action)) {
        show_debug_message("Invalid message format");
        exit;
    }

    var action = msg.action;
    switch (action) {
        case "initState":
            if (!is_undefined(msg.params)) {
                global.players = msg.params.players;
                global.girl = msg.params.girl;
                room_goto(rm_MainRoom);
            }
            break;
        case "playerJoined":
            if (!is_undefined(msg.params) && !is_undefined(msg.params.name))
                show_debug_message("Player joined: " + msg.params.name);
            break;
        case "updatePlayers":
            global.players = msg.params.players;
            break;
        case "updateGirl":
            global.girl = msg.params;
            break;
        case "playerLeft":
            if (!is_undefined(msg.params) && !is_undefined(msg.params.name))
                show_debug_message("Player left: " + msg.params.name);
            break;
        default:
            show_debug_message("Unrecognized action: " + string(action));
    }
}
