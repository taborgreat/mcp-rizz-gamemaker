


var wrapper = html_div(
    undefined,
    "form-wrapper",
    undefined,
    "style",
    "position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); " +
    "width:300px; padding:20px; background:#ffffffcc; border-radius:12px; " +
    "box-shadow:0 4px 16px rgba(0,0,0,0.25); text-align:center; font-family:sans-serif;"
);


var form = html_form(wrapper, "simple-form");



html_field(form, "username", "text", "Type your name...", true, "", "", 13);
html_submit(form, "submit", "Begin", !form_is_loading, form_is_loading ? "loading" : "");

if (html_element_interaction(form)) {
    html_submit_name_connect(form);
	global.html_name_wrapper = wrapper; 
    

}
