var t = move_speed;

x = lerp(x, target_x, t);
y = lerp(y, target_y, t);

depth = depth_start + -y/1000; //depth sorting (stops her from drawing on top of players below her)



