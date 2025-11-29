var total = string_length(full_text);


var ideal_progress = 1 - ((global.timeLeft - 2) / max_time);
ideal_progress = clamp(ideal_progress, 0, 1);
var ideal_limit = floor(total * ideal_progress);


char_timer += 1;
var typed = floor(char_timer * (chars_per_second / room_speed));

// FINAL LIMIT — client types freely but never goes past ideal_limit
visible_chars = typed;

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

