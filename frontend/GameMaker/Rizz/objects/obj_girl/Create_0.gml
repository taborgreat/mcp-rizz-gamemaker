target_x = x;
target_y = y;
move_speed = 1/74;

shadow = instance_create_layer(x,y, "Shadows", obj_shadow)
shadow.owner = id; 

//depth sorting
depth_start = depth;

