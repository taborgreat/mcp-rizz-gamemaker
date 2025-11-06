/// @function gmcallback_setRoomSelected(roomId)
/// @desc Called from React when a room is clicked; sets the global roomSelectedAttempt variable.
function gmcallback_setRoomSelected() {
    var roomId = argument[0];  // Get the first parameter
    global.roomSelectedAttempt = roomId;
    show_debug_message("Room selected: " + string(global.roomSelectedAttempt));
}