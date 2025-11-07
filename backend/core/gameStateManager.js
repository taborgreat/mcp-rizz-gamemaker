import { generateGirlMessage } from "./generateGirlMessage.js";
import girlData from "./utils/girlNames.json" with { type: "json" };
const girlNames = girlData.girlData;

export class GameStateManager {
  constructor(broadcast, girl, playerManager, gameRoomId) {
    this.state = "awaitingPlayers";
    this.broadcast = broadcast;
    this.girl = girl;
    this.players = playerManager;
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

  setState(newState, duration = 0) {
    clearTimeout(this.timer);
    this.state = newState;

    console.log(`🌀 [Room ${this.gameRoomId}] State → ${newState}`);
    this.broadcastWorld();

    switch (newState) {
      case "awaitingPlayers":
        this.girl.resetPosition(this.broadcastRoom.bind(this), this.players);
        break;

      case "countdown": {
        const randomIndex = Math.floor(Math.random() * girlNames.length);
        this.girl.name = girlNames[randomIndex];

        console.log(`💁 [Room ${this.gameRoomId}] Girl's name: ${this.girl.name}`);
        this.broadcastWorld();

        this.broadcastRoom({
          action: "updateGirl",
          params: {
            name: this.girl.name,
            x: this.girl.x,
            y: this.girl.y,
            destination: "center",
          },
        });

        this.startCountdown(duration || 10);
        break;
      }

      case "playersInputting":
        this.startPlayersInputting(duration || 20);
        break;

      case "preparingPlayerSpeaking": {
        console.log(`⏳ [Room ${this.gameRoomId}] Preparing player speaking phase...`);
        this.broadcastRoom({ action: "loadingNextPhase" });
        this.timer = setTimeout(() => this.setState("playerSpeaking"), 500); //RAISE THIS TO ALLOW MORE TIME FOR NETWORK REQUESTS TO ARRIVE
        break;
      }

      case "playerSpeaking":
        this.startSequentialPlayerSpeaking();
        break;

      case "girlSpeaking": {
        const girlMessage = generateGirlMessage(this.players);
        console.log(`💬 [Room ${this.gameRoomId}] Girl says: ${girlMessage}`);

        this.broadcastRoom({
          action: "girlSpeaking",
          params: { girlMessage },
        });

        this.timer = setTimeout(() => this.setState("girlMoving", 20), 5000);
        break;
      }

      case "girlMoving": {
        const activePlayers = this.players.getActivePlayers();
        let destination = "center";

        if (activePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * activePlayers.length);
          destination = activePlayers[randomIndex].name;
        }

        const newPos = this.girl.moveTowards(
          destination,
          this.broadcastRoom.bind(this),
          this.players
        );
        console.log(`💃 [Room ${this.gameRoomId}] Girl moving toward: ${destination}`, newPos);

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
      this.broadcastRoom({ action: "playersInputtingTick", params: { timeLeft } });
      if (timeLeft-- > 0) this.timer = setTimeout(tick, 1000);
      else this.setState("preparingPlayerSpeaking")
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

    const speakNext = () => {
      if (currentIndex >= playerList.length) {
        this.setState("girlSpeaking");
        return;
      }

      const player = playerList[currentIndex];
      let timeLeft = 5;

      console.log(`🎤 [Room ${this.gameRoomId}] ${player.name}: ${player.latestMessage}`);

      const tick = () => {
        this.broadcastRoom({
          action: "playerSpeakingTick",
          params: {
            currentSpeaker: player.name,
            latestMessage: player.latestMessage,
            timeLeft,
          },
        });

        if (timeLeft-- > 0) {
          this.timer = setTimeout(tick, 1000);
        } else {
          currentIndex++;
          speakNext();
        }
      };

      tick();
    };

    speakNext();
  }

  onPlayerJoined(player) {
    if (this.players.countPlayers() >= 2 && this.state === "awaitingPlayers") {
      this.setState("countdown", 10);
    } else {
      this.broadcastWorld();
    }
  }

  onPlayerLeft(player) {
    if (this.players.countPlayers() < 2) {
      clearTimeout(this.timer);
      this.setState("awaitingPlayers");
    } else {
      this.broadcastWorld();
    }
  }
}
