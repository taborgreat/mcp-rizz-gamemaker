var wrapper = html_div(
    undefined,
    "form-wrapper",
    undefined,
    "style",
    "position:absolute; left:50%; top:94%; transform:translate(-50%,-50%); text-align:center; font-family:sans-serif;"
);



var form = html_form(wrapper, "simple-form");



html_field(form, "username", "text", "ENTER NAME", undefined, "", "", 13);

var btn_label = "";
if (is_undefined(global.roomSelectedAttempt)) {
    btn_label = "Play";

} else {
        btn_label = "Join";
}


html_submit(form, "submit", btn_label, !form_is_loading, form_is_loading ? "loading" : "");

if (html_element_interaction(form)) {
    html_submit_name_connect(form);
	global.html_name_wrapper = wrapper; 
    

}
