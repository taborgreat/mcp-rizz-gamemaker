var t = move_speed;

// Play snd_enter once when she starts physically moving during girlMoving state
if (global.gameState == "girlMoving") {
    if (!variable_global_exists("girlMoveSoundPlayed")) global.girlMoveSoundPlayed = false;
    if (!global.girlMoveSoundPlayed && point_distance(x, y, target_x, target_y) > 5) {
        audio_play_sound(snd_enter, 1, false);
        global.girlMoveSoundPlayed = true;
    }
} else {
    global.girlMoveSoundPlayed = false;
}

x = lerp(x, target_x, t);
y = lerp(y, target_y, t);

depth = depth_start + -y/1000; //depth sorting (stops her from drawing on top of players below her)



