/// @function html_submit_player_input(element)
/// @param element The HTML form element to read and clean up after choosing name
function html_submit_player_input(element) {
    var values = html_form_values(element);
    var playerMessage = values[? "playerMessage"];
    ds_map_destroy(values);
	
    if (is_undefined(playerMessage)) playerMessage = "";


    var msg = ds_map_create();
    msg[? "type"] = "player_inputting_turn";
    msg[? "name"] = global.localPlayer.name;
    msg[? "text"] = playerMessage;

    var msg_json = json_encode(msg);

    show_debug_message("Sending: " + msg_json);
    sendToServer(msg_json);

    ds_map_destroy(msg);
    html_element_cleanup(element, true);
    element = undefined;
	 global.inputForm = undefined;
     global.inputWrapper = undefined;
	
	//remove the remaining char box if submitted early
	if (instance_exists(obj_playerMessageRemaining)) instance_destroy(obj_playerMessageRemaining);
}
