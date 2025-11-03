// Safety check - don't proceed if data not ready
if (!variable_global_exists("players") || !variable_global_exists("girl")) {
    show_debug_message("Warning: Global data not ready yet");
    instance_destroy();
    exit;
}

players = global.players;
girl = global.girl;
