 if (global.prevGameState == "playersInputting" && global.gameState != "playersInputting") {
        // Exit input phase
        cleanup_input_form();
    }