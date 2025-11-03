// In the Draw GUI Event
var bx = 600;
var by = 400;
var bw = 200;
var bh = 60;

// Draw the button
draw_set_color(c_dkgray);
draw_rectangle(bx, by, bx + bw, by + bh, false);
draw_set_color(c_white);
draw_text(bx + 50, by + 20, "Begin");

// Check click
if (mouse_check_button_pressed(mb_left)) {
    var mx = device_mouse_x_to_gui(0);
    var my = device_mouse_y_to_gui(0);

    if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
        if (string_length(name_input) > 0) {
        connectToServer(name_input);

        }
    }
}
