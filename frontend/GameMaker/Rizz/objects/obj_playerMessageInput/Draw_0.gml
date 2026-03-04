

var wrapper = html_div(
    undefined,
    "input-wrapper",
    undefined,
    "message-wrapper",
    ""
);

var form = html_form(wrapper, "player-input-form", "message-form");




html_field(form, "playerMessage", "text", "Type your line...", true, "", "", 130);
html_submit(form, "submit", "Send", !form_is_loading, form_is_loading ? "loading" : "");

global.inputWrapper = wrapper;
global.inputForm = form;


// --- get current form values ---
var values2 = html_form_values(form);
var playerText2 = "";
if (ds_map_exists(values2, "playerMessage")) {
    playerText2 = string_trim(values2[? "playerMessage"]);
}
ds_map_destroy(values2);


global.playerTextDraft = playerText2;




if (html_element_interaction(form)) {
    html_submit_player_input(form);
    html_element_cleanup(wrapper, true);
	 global.inputForm = undefined;
     global.inputWrapper = undefined;
    form = undefined;
	instance_destroy();
}
