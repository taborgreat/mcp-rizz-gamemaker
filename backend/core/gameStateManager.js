export class GameStateManager {
  constructor(broadcast, girl, playerManager) {
    this.state = "awaitingPlayers";
    this.broadcast = broadcast;
    this.girl = girl;
    this.players = playerManager;
    this.timer = null;
  }

  broadcastWorld() {
    this.broadcast(this.players.players, {
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

    console.log(`🌀 Game state changed to: ${newState}`);
    this.broadcastWorld();

    switch (newState) {
      case "countdown":
        this.startCountdown(duration || 10);
        break;

      case "playersInputting":
        this.startPlayersInputting(duration || 20);
        break;

      case "playerSpeaking":
        this.startSequentialPlayerSpeaking();
        break;

      case "girlSpeaking":
        this.timer = setTimeout(() => this.setState("girlMoving", 20), 5000);
        break;

      case "girlMoving":
        this.timer = setTimeout(
          () => this.setState("playersInputting", 20),
          5000
        );
        break;
    }
  }

  startCountdown(seconds) {
    let timeLeft = seconds;
    const tick = () => {
      this.broadcast(this.players.players, {
        action: "countdownTick",
        params: { timeLeft },
      });
      if (timeLeft-- > 0) this.timer = setTimeout(tick, 1000);
      else this.setState("playersInputting");
    };
    tick();
  }

  startPlayersInputting(seconds) {
    let timeLeft = seconds;
    const tick = () => {
      this.broadcast(this.players.players, {
        action: "playersInputtingTick",
        params: { timeLeft },
      });
      if (timeLeft-- > 0) this.timer = setTimeout(tick, 1000);
      else this.setState("playerSpeaking");
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

      console.log(`🎤 ${player.name}: ${player.latestMessage}`);

      const tick = () => {
        this.broadcast(this.players.players, {
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

  onPlayerJoined() {
    if (this.players.players.size >= 2 && this.state === "awaitingPlayers") {
      this.setState("countdown", 10);
    } else {
      this.broadcastWorld();
    }
  }

  onPlayerLeft() {
    if (this.players.players.size < 2) {
      clearTimeout(this.timer);
      this.setState("awaitingPlayers");
    } else {
      this.broadcastWorld();
    }
  }
}
