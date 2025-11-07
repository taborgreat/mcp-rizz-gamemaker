
if (variable_global_exists("connectionLostMessage") && global.connectionLostMessage != undefined) {
    var o = instance_create_layer(room_width / 2, room_height / 2, "Instances", obj_RoomsAlertMessage);
    o.text = global.connectionLostMessage;
    o.alarm[0] = room_speed * 3;
    global.connectionLostMessage = undefined;
}
