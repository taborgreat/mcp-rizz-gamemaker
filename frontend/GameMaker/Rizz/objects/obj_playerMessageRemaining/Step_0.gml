
if (variable_global_exists("playerTextDraft")) {
    current_text = global.playerTextDraft;
}




remaining = max_chars - string_length(current_text);
if (remaining < 0) remaining = 0;
