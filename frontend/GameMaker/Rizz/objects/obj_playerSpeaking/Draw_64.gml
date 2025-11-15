if (instance_exists(obj_curtain_left)) {
    if (obj_curtain_left.state == "open") {

        draw_set_color(c_white);
        draw_set_halign(fa_left);

        var partial = string_copy(full_text, 1, visible_chars);

        var wrap_width = 800;
        var line_sep = 50;

        draw_text_ext(x * 3, y * 3.7, speaker + ": " + partial, line_sep, wrap_width);
    }
}
