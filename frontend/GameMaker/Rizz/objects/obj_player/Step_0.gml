//breathing animation
xscale = sine_between((randomOffset+current_time/1000)+(breath_spd*0.75), breath_spd, 0.95, 1.05);
yscale = sine_between(randomOffset+current_time/1000, breath_spd, 0.9, 1.1);