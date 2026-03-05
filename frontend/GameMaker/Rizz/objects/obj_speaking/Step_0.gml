var total = string_length(full_text);


var ideal_progress = 1 - ((global.timeLeft - 2) / max_time);
ideal_progress = clamp(ideal_progress, 0, 1);
var ideal_limit = floor(total * ideal_progress);


// Hold text until the box has finished expanding
if (instance_exists(bg) && bg.image_yscale < bg.target_yscale * 0.95) {
    char_timer = 0;
} else {
    char_timer += 1;
}
var typed = floor(char_timer * (chars_per_second / room_speed));

// FINAL LIMIT — client types freely but never goes past ideal_limit
var prev_chars = visible_chars;
visible_chars = typed;

// Play dialogue sound every 3 new characters while text is still typing
if (visible_chars > prev_chars && visible_chars < string_length(full_text)) {
    if (visible_chars mod 3 == 0 && full_text != "Player missed their turn" && full_text != "...") {
        var _snd_pick = irandom(3);
        var _snd = ((_snd_pick == 0) ? snd_dialogue : ((_snd_pick == 1) ? snd_dialogue_1 : ((_snd_pick == 2) ? snd_dialogue_2 : snd_dialogue_3)));
        audio_play_sound(_snd, 1, false);
    }
}

if(speaker == global.girlName){
	with(obj_speakingBG){
		girlSpeaking = true;
	}

} else {
		with(obj_speakingBG){
		girlSpeaking = false;
	}

}


//conttrol mouth
mouth_timer += delta_time; 

if (mouth_timer >= 100000) { 
    mouth_opened = !mouth_opened; 
    mouth_timer = 0; 
}

