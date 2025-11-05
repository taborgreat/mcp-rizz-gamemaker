/// @function html_submit_name_connect(element)
/// @param element The HTML form element to read and clean up after choosing name
function html_submit_name_connect(element) {
    var values = html_form_values(element);
    var name = values[? "username"];
    ds_map_destroy(values);

    if (string_length(name) <= 0) {
        show_message("Please enter your name first!");
        return;
    }

    global.playerName = name;
    connectToServer(name);

    // 🧹 Clean up HTML after submit
    html_element_cleanup(element, true);
    element = undefined;
}
