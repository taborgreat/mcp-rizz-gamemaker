

var wrapper = html_div(
    undefined,
    "input-wrapper",
    undefined,
    "style",
    "position:absolute; left:50%; top:70%; transform:translate(-50%,-50%); " +
    "width:360px; padding:20px; background:#ffffffcc; border-radius:12px; " +
    "box-shadow:0 4px 16px rgba(0,0,0,0.25); text-align:center; font-family:sans-serif;"
);


var form = html_form(wrapper, "player-input-form");


html_field(form, "playerMessage", "text", "Type your line...", true, "", "");
html_submit(form, "submit", "Send", !form_is_loading, form_is_loading ? "loading" : "");

if (html_element_interaction(form)) {
    html_submit_player_input(form);
    html_element_cleanup(wrapper, true);
    form = undefined;
	instance_destroy();
}
else if (current_time > destroy_time) {
	html_submit_missed_turn();
    html_element_cleanup(wrapper, true);
    instance_destroy();
}

