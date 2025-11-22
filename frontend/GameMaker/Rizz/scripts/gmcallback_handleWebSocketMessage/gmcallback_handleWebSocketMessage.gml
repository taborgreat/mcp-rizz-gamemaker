/// @function gmcallback_handleWebSocketMessage(rawJson)
/// @desc Called from JS bridge when data arrives
function gmcallback_handleWebSocketMessage(rawJson) {
    if (is_undefined(rawJson)) exit;

    var msg = json_parse(rawJson);
    if (is_undefined(msg) || is_undefined(msg.action)) exit;

    var action = msg.action;

    switch (action) {

        case "worldUpdate": {
            // -------------------------
            // 1) PREP: safely ensure global.world exists (reuse the same struct)
            // -------------------------
            if (!variable_global_exists("world") || is_undefined(global.world) || !is_struct(global.world)) {
                global.world = {};
            }

            // Instead of replacing the whole struct (which causes heap churn),
            // patch only the fields we use. This keeps GC pressure low.
            if (is_struct(msg.world)) {
                // Common fields we expect — copy them if present.
                if (variable_struct_exists(msg.world, "gameState")) global.world.gameState = msg.world.gameState;
                if (variable_struct_exists(msg.world, "players")) global.world.players = msg.world.players;
                if (variable_struct_exists(msg.world, "girl")) global.world.girl = msg.world.girl;
                // If there are other fields you rely on, add them here similarly.
            } else {
                // fallback: preserve world but try to set at least the gameState
                if (variable_struct_exists(msg, "world") && variable_struct_exists(msg.world, "gameState"))
                    global.world.gameState = msg.world.gameState;
            }

            var state = global.world.gameState;

            // -------------------------
            // 2) Update visuals once (removed duplicate call)
            // -------------------------
            if (instance_exists(obj_gameController)) {
                with (obj_gameController) {
                    update_world_state(global.world);
                }
            }

            // -------------------------
            // 3) Update localPlayer spectator status from players list
            // -------------------------
            var lp = undefined;
            var players = global.world.players;

            if (!is_undefined(players)) {
                for (var i = 0; i < array_length(players); i++) {
                    if (players[i].name == global.localPlayer.name) {
                        lp = players[i];
                        break;
                    }
                }
            }

            if (lp != undefined) {
                global.localPlayer.isSpectator = lp.isSpectator;
            } else {
                global.localPlayer.isSpectator = false;
            }

            // Done with worldUpdate
            break;
        }

        case "countdownTick": {
            global.timeLeft = msg.params.timeLeft;
            global.statusText = "Game starting in " + string(global.timeLeft);
            break;
        }

        case "playersInputtingTick": {
            global.timeLeft = msg.params.timeLeft;
            global.statusText = "Players are typing... (" + string(global.timeLeft) + ")";

            if (global.timeLeft <= 0) {
                cleanup_input_form();
            }
            break;
        }

        case "playerSpeakingTick": {
            global.currentSpeaker = msg.params.currentSpeaker;
            global.playerLatestMessage = msg.params.latestMessage;
            global.timeLeft = msg.params.timeLeft;
			global.currentSpeakerStyle = msg.params.style;
			global.currentSpeakerSlot = msg.params.slot;
			global.girlEmotion = msg.params.girlEmotion;
			
			 if (msg.params.isGirlResponse) {
        global.displaySpeakerName = global.girlName;
    } else {
        global.displaySpeakerName = global.currentSpeaker;
    }

            // Create once if needed, otherwise update fields.
            if (!instance_exists(obj_playerSpeaking)) {
                var o = instance_create_layer(50, 150, "Instances", obj_playerSpeaking);
                o.speaker = global.displaySpeakerName;
                o.full_text = global.playerLatestMessage;
                o.visible_chars = 0;
                o.char_timer = 0;
                o.last_timeleft = global.timeLeft;
				o.speaker_style = global.currentSpeakerStyle;
				o.speaker_slot = global.currentSpeakerSlot;
				
            } else {
                with (obj_playerSpeaking) {
                    // MESSAGE CHANGED
                    if (full_text != global.playerLatestMessage) {
                        full_text = global.playerLatestMessage;
                        visible_chars = 0;
                        char_timer = 0;
                    }

                    // NEW SPEAKING ROUND (timeLeft jumped up)
                    if (global.timeLeft > last_timeleft) {
                        visible_chars = 0;
                        char_timer = 0;
                    }

                    last_timeleft = global.timeLeft;
                    speaker = global.displaySpeakerName;
					speaker_style = global.currentSpeakerStyle;
					speaker_slot = global.currentSpeakerSlot;

                }
            }
            break;
        }

        case "girlSpeaking": {
            global.girlMessage = msg.params.girlMessage;
			global.girlEmotion = msg.params.girlEmotion;
            global.statusText = "The girl is speaking...";

            if (!instance_exists(obj_girlSpeaking)) {
                var g = instance_create_layer(400, 200, "Instances", obj_girlSpeaking);
                g.speaker = global.girlName;
                g.text = global.girlMessage;
            } else {
                with (obj_girlSpeaking) {
                    speaker = global.girlName;
                    text = global.girlMessage;
                }
            }
            break;
        }

        case "updateGirl": {
            var newX = msg.params.x;
            var newY = msg.params.y;
            var destination = msg.params.destination;
            var girlName = msg.params.name;

            if (instance_exists(obj_girl)) {
                obj_girl.target_x = newX;
                obj_girl.target_y = newY;
                obj_girl.currentDestination = destination;
                obj_girl.girlName = girlName;
            }
            break;
        }

        case "playerJoined": {
            show_debug_message("Player joined: " + msg.params.name);

            // Only cleanup HTML elements if they exist (avoid repeated cleanup calls)
            if (variable_global_exists("html_name_form") && global.html_name_form != undefined) {
                // cleanup once and flag undefined afterwards
                html_element_cleanup(global.html_name_form, true);
                global.html_name_form = undefined;
            }

            if (variable_global_exists("html_name_wrapper") && global.html_name_wrapper != undefined) {
                html_element_cleanup(global.html_name_wrapper, true);
                global.html_name_wrapper = undefined;
            }

            // set player settings
            global.currentRoomId = msg.params.gameRoomId;
            global.localPlayer = { name: msg.params.name };

            room_goto(rm_MainRoom);
            global.isJoiningGame = false;
            break;
        }

        case "playerLeft": {
            show_debug_message("Player left: " + msg.params.name);
            break;
        }

        default: {
            show_debug_message("Unrecognized action: " + string(action));
            break;
        }
    }
}
