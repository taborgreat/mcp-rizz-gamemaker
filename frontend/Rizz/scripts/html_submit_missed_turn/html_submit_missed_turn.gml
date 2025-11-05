/// @function html_submit_missed_turn()
/// @desc Sends a "missed turn" message to the server without using the form
function html_submit_missed_turn() {
    var msg = ds_map_create();
    msg[? "type"] = "player_inputting_turn";
    msg[? "name"] = global.localPlayer.name;
    msg[? "text"] = "Player missed their turn"; 

    var msg_json = json_encode(msg);

    show_debug_message("Sending missed turn: " + msg_json);
    sendToServer(msg_json);

    ds_map_destroy(msg);
}
