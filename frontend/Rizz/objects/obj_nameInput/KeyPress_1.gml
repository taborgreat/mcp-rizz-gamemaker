if (keyboard_lastkey >= ord("A") && keyboard_lastkey <= ord("Z")) {
    name_input += chr(keyboard_lastkey);
}
if (keyboard_lastkey == vk_backspace && string_length(name_input) > 0) {
    name_input = string_delete(name_input, string_length(name_input), 1);
}
