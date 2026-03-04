xscale = 1;			//using these to prevent the collision_box from rescaling
yscale = 1;
breath_spd = 1.5;		//speed that player breathes

randomOffset = irandom(1000)

//depth sorting
depth_start = depth;
depth = depth_start + -y/1000;

//create shadow object
shadow = instance_create_layer(x,y, "Shadows", obj_shadow);
shadow.owner = id;

// Walk animation state
walk_state = "idle";	// "walking_in", "idle", "walking_out"
target_x = x;
target_y = y;
exit_x = -150;			// overridden before walk_out begins
walk_spd = 8;			// pixels per step when walking out