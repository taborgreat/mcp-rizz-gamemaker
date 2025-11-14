 if (global.gameState != "playersInputting" || global.localPlayer.isSpectator) {
        // Exit input phase
        cleanup_input_form();
    }