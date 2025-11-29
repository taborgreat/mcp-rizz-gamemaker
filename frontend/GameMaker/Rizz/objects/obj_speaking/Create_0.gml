//note, this is currently handling the player_portrait, while the girl portrait object
//is drawn instead if she is speaking. should either make obj_player_portrait
//and spawn dependtly, or combine obj_girl_portrait into this. first is better

full_text = "";
visible_chars = 0;
char_timer = 0;
chars_per_second = 20; // adjust this for speed (higher = faster)
max_time = 11;

bg = instance_create_layer(96, 192, "GUI", obj_speakingBG);
bg.depth -=10 //move in front of portraits on same layer


//mouth timing
mouth_timer = 0;
mouth_opened = true;
