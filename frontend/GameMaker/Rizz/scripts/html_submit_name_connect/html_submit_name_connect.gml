/// @function html_submit_name_connect(element)
/// @param element The HTML form element to read and clean up after choosing name
function html_submit_name_connect(element) {
	
	if (global.isJoiningGame) {
        return;
    }
	global.isJoiningGame = true;
	
    var values = html_form_values(element);
    var name = values[? "username"];
    ds_map_destroy(values);

    var msg = ds_map_create();
    msg[? "name"] = name;
    msg[? "gameRoomId"] = global.roomSelectedAttempt;

    var ps = array_create(3);
    ps[0] = global.playerHead;
    ps[1] = global.playerFace;
    ps[2] = global.playerMouth;
    msg[? "playerStyle"] = ps;


    var msg_json = json_encode(msg);
    show_debug_message("➡️ Sending join message: " + msg_json);
    connectToServer(msg_json);

    ds_map_destroy(msg);
    global.html_name_form = element;
}
