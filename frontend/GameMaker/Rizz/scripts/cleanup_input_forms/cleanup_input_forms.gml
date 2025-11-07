/// @function cleanup_input_form()
/// @desc Submits or misses turn, destroys form and wrapper if they exist
function cleanup_input_form() {
    if (variable_global_exists("inputForm") && global.inputForm != undefined) {
        var form = global.inputForm;
        var wrapper = global.inputWrapper;
        var playerText = "";

        var values = html_form_values(form);
        if (ds_map_exists(values, "playerMessage")) {
            playerText = string_trim(values[? "playerMessage"]);
        }
        ds_map_destroy(values);

        if (string_length(playerText) > 0) {
            html_submit_player_input(form);
        } else {
            html_submit_missed_turn();
        }

        html_element_cleanup(wrapper, true);
        global.inputForm = undefined;
        global.inputWrapper = undefined;

        if (instance_exists(obj_playerMessageInput))
            with (obj_playerMessageInput) instance_destroy();
    }
}