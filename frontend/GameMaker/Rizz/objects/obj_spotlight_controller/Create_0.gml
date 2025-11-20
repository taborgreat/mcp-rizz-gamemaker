
lerp_speed = 0.1;

// Create spotlight instances on a specific layer
spot1 = instance_create_layer(obj_girl.x, obj_girl.y, "Lights", obj_spotlight);
spot2 = instance_create_layer(0, 0, "Lights", obj_spotlight);


spot1.index = 1; //players
spot2.index = 2; //girl


spot1_target_x =  obj_girl.x;
spot1_target_y =  obj_girl.y;
spot2_target_x = 0;
spot2_target_y = 0;
