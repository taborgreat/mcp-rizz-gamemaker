function get_speaker_instance() {
    var arr = global.chairs;  

    for (var i = 0; i < array_length(arr); i++) {
        var chair = arr[i];   // instance ID

        if (instance_exists(chair.occupant)) {
            var occ = chair.occupant;

            if (occ.name == global.currentSpeaker) {
                return occ;
            }
        }
    }

    return noone;
}
