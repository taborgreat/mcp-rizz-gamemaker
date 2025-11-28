import { sleep } from "groq-sdk/core.mjs";
import { generateGirlThoughts } from "./utils/generateGirlThoughts.js";
import girlData from "./utils/girlNames.json" with { type: "json" };
const girlNames = girlData.girlData;

export class GameState {
  constructor(broadcast, girl, players, gameRoomId) {
    this.state = "awaitingPlayers";
    this.broadcast = broadcast;
    this.girl = girl;
    this.players = players;
    this.timer = null;
    this.gameRoomId = gameRoomId;
  }

  broadcastRoom(message) {
    this.broadcast(this.players.players, {
      ...message,
      gameRoomId: this.gameRoomId,
    });
  }

  broadcastWorld() {
    this.broadcastRoom({
      action: "worldUpdate",
      world: {
        gameState: this.state,
        players: this.players.getAllPlayers(),
        girl: this.girl.getState(),
      },
    });
  }

  async setState(newState, duration = 0) {
    clearTimeout(this.timer);
    this.state = newState;

    console.log(`🌀 [Room ${this.gameRoomId}] State → ${newState}`);
    this.broadcastWorld();

    switch (newState) {
      case "awaitingPlayers":
        this.girl.resetPosition(this.broadcastRoom.bind(this), this.players);
        this.players.resetAllRanksToTie();
        this.players.resetAllMessagesToDefault();

        break;

      case "countdown": {
        const randomIndex = Math.floor(Math.random() * girlNames.length);
        this.girl.name = girlNames[randomIndex];
        this.girl.style = this.girl.generateRandomStyle();

        console.log(
          `💁 [Room ${this.gameRoomId}] Girl's name: ${this.girl.name}`
        );
        this.broadcastWorld();

        this.broadcastRoom({
          action: "updateGirl",
          params: {
            name: this.girl.name,
            x: this.girl.x,
            y: this.girl.y,
            destination: "stay",
          },
        });

        this.startCountdown(duration || 10);
        break;
      }

      case "playersInputting":
        this.startPlayersInputting(duration || 20);
        break;

      case "preparingPlayerSpeaking": {
        sleep(300); // allow slower requests to come in before querying
        console.log(
          `⏳ [Room ${this.gameRoomId}] Preparing player speaking phase...`
        );
        const allPlayers = this.players.getAllPlayers();
        for (const player of allPlayers) {
          if (player.currentText === player.latestMessage) {
            console.log("missed turn, setting manually", player);
            player.latestMessage = "Player missed their turn";
          }
          //im goin to add if its player missed their turn twice in a row then you get kicked from websocet

          player.currentText = player.latestMessage;
        }
        await generateGirlThoughts(this.girl, this.players, this.gameRoomId);
        this.broadcastRoom({ action: "loadingNextPhase" });
        this.timer = setTimeout(() => this.setState("playerSpeaking"), 700); //RAISE THIS TO ALLOW MORE TIME FOR NETWORK REQUESTS TO ARRIVE
        break;
      }

      case "playerSpeaking":
        this.startSequentialPlayerSpeaking();
        break;

      case "girlSpeaking": {
      
        console.log(`💬 [Room ${this.gameRoomId}] Girl says: ${this.girl.movementDecision.reason}`);

        this.broadcastRoom({
          action: "girlSpeaking",
            params: {
    girlMessage: this.girl.movementDecision.reason,
    emotion: this.girl.movementDecision.emotion,
  },
        });

        this.timer = setTimeout(() => this.setState("girlMoving", 20), 5000);
        break;
      }

      case "girlMoving": {
         const decision = this.girl.movementDecision;

        let destination = "stay"; //default in case error

        if (decision && decision.destination) {
           destination = decision.destination;
        }

        const handleGameWin = (winnerName) => {

          console.log(
            `🏆 [Room ${this.gameRoomId}] ${winnerName} won the round!`
          );

          this.broadcastRoom({
            action: "playerWon",
            params: { name: winnerName },
          });
         
          setTimeout(() => {
            this.players.winReset(winnerName);
            this.girl.resetPosition();
            const activePlayers = this.players.getActivePlayers();

            if (activePlayers.length <= 1) {
              this.setState("awaitingPlayers");
            } else {
              this.setState("countdown", 5);
            }
          }, 4000);
        };

        const result = this.girl.moveTowards(destination, handleGameWin);

if (result.win) {
  break;
}

        console.log(
          `💃 [Room ${this.gameRoomId}] Girl moving toward: ${destination}`,
          result.newPos
        );

        this.players.updateRanks(this.girl);
        this.broadcastWorld();

        this.timer = setTimeout(() => {
          this.setState("playersInputting", 20);
        }, 5000);

        break;
      }
    }
  }

  startCountdown(seconds) {
    let timeLeft = seconds;
    const tick = () => {
      this.broadcastRoom({ action: "countdownTick", params: { timeLeft } });
      if (timeLeft-- > 0) this.timer = setTimeout(tick, 1000);
      else this.setState("playersInputting");
    };
    tick();
  }

  startPlayersInputting(seconds) {
    let timeLeft = seconds;
    const tick = () => {
      this.broadcastRoom({
        action: "playersInputtingTick",
        params: { timeLeft },
      });
      if (timeLeft-- > 0) this.timer = setTimeout(tick, 1000);
      else this.setState("preparingPlayerSpeaking");
    };
    tick();
  }

 startSequentialPlayerSpeaking() {
  const playerList = this.players.getActivePlayers();
  if (playerList.length === 0) {
    this.setState("awaitingPlayers");
    return;
  }

  let currentIndex = 0;
  let showingGirlResponse = false;

  const speakNext = () => {
    if (currentIndex >= playerList.length) {
      this.setState("girlSpeaking");
      return;
    }



    const player = playerList[currentIndex];
    let message;
    let speakingDuration;

    if (!showingGirlResponse) {

      // PPLAYER’S MESSAGE

      message = player.latestMessage || "";

      if (message === "Player missed their turn") {
        speakingDuration = 3;
      } else {
        const messageLength = message.length;
        const minDuration = 4;
        const maxDuration = 11;
        const baseTime = 2;
        const charsPerSecond = 20;

        const estimatedTime = baseTime + messageLength / charsPerSecond;
        const clampedTime = Math.max(
          minDuration,
          Math.min(estimatedTime, maxDuration)
        );

        const variedTime = clampedTime * (0.9 + Math.random() * 0.2);
        speakingDuration = Math.round(variedTime);
      }

      console.log(
        `🎤 [Room ${this.gameRoomId}] ${player.name}: "${message}" (${speakingDuration}s)`
      );

    } else {
     
      // GIRLS MESSAGE
   
      message = player.latestGirlMessage || "…";
      speakingDuration = 5;

      console.log(
        `💬 [Room ${this.gameRoomId}] Girl responding to ${player.name}: "${message}" (5s)`
      );
    }

    let remainingSeconds = speakingDuration;

    const tick = () => {
  let emotionToSend = "neutral";

  if (!showingGirlResponse) {

    const halfPoint = Math.floor(speakingDuration / 2);

    if (remainingSeconds <= speakingDuration - halfPoint) {
      emotionToSend = player.latestGirlListeningEmotion;   //send during second half as a reaction
    }

  } else {
   
    emotionToSend = player.latestGirlResponseEmotion;     
  }
      this.broadcastRoom({
        action: "playerSpeakingTick",
        params: {
          currentSpeaker: player.name,
          slot: player.slot,
          style: player.style,

          latestMessage: message,          // changes based on phase
          isGirlResponse: showingGirlResponse,

          timeLeft: remainingSeconds,
          girlEmotion: emotionToSend, 
        },
      });

        if (remainingSeconds-- > 0) {
  this.timer = setTimeout(tick, 1000);
} else {

  if (player.latestMessage === "Player missed their turn") {
    showingGirlResponse = false;
    currentIndex++;
    speakNext();
    return;
  }

  if (!showingGirlResponse) {

    showingGirlResponse = true;
    speakNext();
  } else {
    // done with both phases ,next player
    showingGirlResponse = false;
    currentIndex++;
    speakNext();
  }
}

    };

    tick();
  };

  speakNext();
}


  onPlayerJoined(player) {
    if (this.players.countPlayers() >= 2 && this.state === "awaitingPlayers") {
      this.setState("countdown", 5);
    } else {
      this.broadcastWorld();
    }
  }

  onPlayerLeft(player) {
    if (this.players.countPlayers() < 2) {
      clearTimeout(this.timer);
      this.setState("awaitingPlayers");
    } else {
      this.players.updateRanks(this.girl);

      this.broadcastWorld();
    }
  }
}
