current_text = "";
max_chars = 130;
remaining = max_chars;

if (variable_global_exists("playerTextDraft")) {
    current_text = global.playerTextDraft;
}