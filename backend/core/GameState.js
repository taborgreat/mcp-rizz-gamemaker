import { roomGameWins, roomResets, roomRoundsPlayed, roomTurnsTotal, roomTurnsMissed, roomTurnsSuccess } from "../metricsServer.js";

import { collectAndApplyPlayerResponses, runAndApplyMovementDecision, processPlayerMessage } from "./utils/generateGirlThoughts.js";
import { generateGirlIdentity, generateGirlIntroMessage } from "./LLM.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class GameState {
  constructor(broadcast, girl, players, gameRoomId) {
    this.state = "awaitingPlayers";
    this.broadcast = broadcast;
    this.girl = girl;
    this.players = players;
    this.timer = null;
    this.gameRoomId = gameRoomId;
    this.pendingResponses = new Map();
    this.isFirstRound = true;
    this.girlIntroGenPromise = null;
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
        this.girl.style = this.girl.generateRandomStyle();
        this.isFirstRound = true; // new girl each countdown → show intro once

        generateGirlIdentity()
          .then((identity) => {
            this.girl.name = identity.name;
            this.girl.personality = identity.personality;
            this.girl.traits = identity.traits || [];
            this.girl.conversationStyle = identity.conversationStyle || "";
            this.girl.politicalLean = identity.politicalLean || "neutral";
            this.girl.recentEvents = identity.recentEvents || [];
            this.girl.familyFacts = identity.familyFacts || [];
            this.girl.memoryBank = [];

            console.log(
              `💁 [Room ${this.gameRoomId}] Girl: ${identity.name} — ${identity.personality}`
            );
            console.log(
              `    traits:${this.girl.traits.join(", ")} style:${this.girl.conversationStyle} polit:${this.girl.politicalLean}`
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

            // Chain intro generation now that personality is set
            this.girlIntroGenPromise = generateGirlIntroMessage(this.girl)
              .then((result) => {
                this.girl.introMessage = result.introMessage;
                this.girl.introEmotion = result.introEmotion;
                console.log(`🎤 [Room ${this.gameRoomId}] Girl intro ready: "${result.introMessage}"`);
              })
              .catch((err) => {
                console.error("Failed to generate girl intro:", err);
                this.girl.introMessage = "…well, here I am.";
                this.girl.introEmotion = "neutral";
              });
          })
          .catch((err) => {
            console.error("Failed to generate girl identity:", err);
            this.girl.name = "Mia";
            this.girl.introMessage = "…well, here I am.";
            this.girl.introEmotion = "neutral";
            this.broadcastWorld();
          });

        this.startCountdown(duration || 10);
        break;
      }

      case "girlEntering": {
        // Tell clients to snap girl to off-screen and walk to center (she uses her natural slow lerp)
        this.broadcastRoom({
          action: "girlEntering",
          params: {
            startX: -100,
            startY: this.girl.center.y,
            targetX: this.girl.center.x,
            targetY: this.girl.center.y,
          },
        });
        // Wait ~4 s for the walk animation, then show the intro line
        this.timer = setTimeout(() => this.setState("girlIntro"), 4000);
        break;
      }

      case "girlIntro": {
        // Snap girl to center on backend now that the walk animation is done
        this.girl.x = this.girl.center.x;
        this.girl.y = this.girl.center.y;

        // Wait for intro generation (kicked off during countdown) if still running
        if (this.girlIntroGenPromise) {
          await this.girlIntroGenPromise;
          this.girlIntroGenPromise = null;
        }

        const introMsg = this.girl.introMessage || "…well, here I am.";
        const introEmotion = this.girl.introEmotion || "neutral";
        console.log(`🎤 [Room ${this.gameRoomId}] Girl intro: "${introMsg}"`);

        // Dynamic duration similar to girlSpeaking
        const msgLen = introMsg.length;
        const introDuration = Math.round(
          Math.max(4, Math.min(2 + msgLen / 20, 15)) * (0.9 + Math.random() * 0.2)
        ) + 2;

        let remainingSeconds = introDuration;
        const tick = () => {
          this.broadcastRoom({
            action: "girlIntro",
            params: {
              girlMessage: introMsg,
              girlEmotion: introEmotion,
              timeLeft: remainingSeconds,
            },
          });

          if (remainingSeconds-- > 0) {
            this.timer = setTimeout(tick, 1000);
          } else {
            this.setState("playersInputting");
          }
        };
        tick();
        break;
      }

      case "playersInputting":
        this.isFirstRound = false;
        this.pendingResponses = new Map();
        this.startPlayersInputting(duration || 25);
        break;

      case "preparingPlayerSpeaking": {
        await sleep(1500);
        console.log(
          `⏳ [Room ${this.gameRoomId}] Preparing player speaking phase...`
        );
        const allPlayers = this.players.getAllPlayers();
        for (const player of allPlayers) {
          roomTurnsTotal.inc({ roomId: this.gameRoomId });

          if (player.currentText === player.latestMessage) {
            console.log("missed turn, setting manually", player);
            player.latestMessage = "Player missed their turn";
            roomTurnsMissed.inc({ roomId: this.gameRoomId });
          } else {
            roomTurnsSuccess.inc({ roomId: this.gameRoomId });
          }

          player.currentText = player.latestMessage;
        }

        // Collect precomputed responses from eager LLM calls
        let precomputed = null;
        if (this.pendingResponses.size > 0) {
          await Promise.all(
            [...this.pendingResponses.values()].map((e) => e.promise)
          );
          precomputed = [...this.pendingResponses.values()]
            .filter((e) => e.result !== null)
            .map((e) => e.result);
        }

        // Phase 1: Apply player responses so playerSpeaking can start immediately
        const playerResponses = await collectAndApplyPlayerResponses(
          this.girl, this.players, this.gameRoomId, precomputed
        );

        // Phase 2: Fire movement decision in the background (runs during playerSpeaking)
        this.movementDecisionPromise = runAndApplyMovementDecision(
          this.girl, this.players, this.gameRoomId, playerResponses
        ).catch((err) => {
          console.error(`Movement decision error [Room ${this.gameRoomId}]:`, err);
          this.girl.movementDecision = { destination: "stay", reason: "...", emotion: "neutral" };
        });

        // Start showing player conversations immediately — no waiting for movement decision
        this.broadcastRoom({ action: "loadingNextPhase" });
        this.timer = setTimeout(() => this.setState("playerSpeaking"), 700);
        break;
      }

      case "playerSpeaking":
        this.startSequentialPlayerSpeaking();
        break;

      case "girlSpeaking": {
        // Wait for movement decision if it's still running
        if (this.movementDecisionPromise) {
          await this.movementDecisionPromise;
          this.movementDecisionPromise = null;
        }

        // Cap reason length
        const MAX_REASON_LENGTH = 600;
        let girlReason = this.girl.movementDecision.reason || "...";
        if (girlReason.length > MAX_REASON_LENGTH) {
          const cutoff = girlReason.lastIndexOf(" ", MAX_REASON_LENGTH);
          girlReason = girlReason.slice(0, cutoff > 0 ? cutoff : MAX_REASON_LENGTH) + "…";
        }

        console.log(`💬 [Room ${this.gameRoomId}] Girl says: ${girlReason}`);

        // Dynamic duration based on message length
        const reasonLength = girlReason.length;
        const minDuration = 4;
        const maxDuration = 18;
        const baseTime = 2;
        const charsPerSecond = 20;
        const estimatedTime = baseTime + reasonLength / charsPerSecond;
        const girlSpeakingDuration = Math.round(
          Math.max(minDuration, Math.min(estimatedTime, maxDuration)) * (0.9 + Math.random() * 0.2)
        ) + 3;

        let remainingSeconds = girlSpeakingDuration;
        let destPlayerLeft = false;

        // Look up target player once so the frontend can show their portrait
        const initialDest = this.girl.movementDecision.destination;
        let targetSlot = -1;
        let targetStyle = [];
        if (initialDest !== "stay" && initialDest !== "center") {
          const tp = this.players.getActivePlayers().find(
            (p) => p.name.toLowerCase() === initialDest.toLowerCase()
          );
          if (tp) { targetSlot = tp.slot; targetStyle = tp.style || []; }
        }

        const tick = () => {
          // Check if chosen player left during girl speaking
          const dest = this.girl.movementDecision.destination;
          if (!destPlayerLeft && dest !== "stay" && dest !== "center") {
            const stillHere = this.players.getActivePlayers().some(
              (p) => p.name.toLowerCase() === dest.toLowerCase()
            );
            if (!stillHere) {
              destPlayerLeft = true;
              girlReason = `wait, where'd ${dest} go? guess they couldn't handle me`;
              this.girl.movementDecision.destination = "stay";
              this.girl.movementDecision.reason = girlReason;
              remainingSeconds = 2;
              targetSlot = -1;
              targetStyle = [];
              console.log(`🚪 [Room ${this.gameRoomId}] ${dest} left during girlSpeaking`);
            }
          }

          this.broadcastRoom({
            action: "girlSpeaking",
            params: {
              girlMessage: girlReason,
              girlEmotion: destPlayerLeft ? "neutral" : this.girl.movementDecision.emotion,
              timeLeft: remainingSeconds,
              targetSlot,
              targetStyle,
            },
          });

          if (remainingSeconds-- > 0) {
            this.timer = setTimeout(tick, 1000);
          } else {
            this.setState("girlMoving", 20);
          }
        };

        tick();
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
          roomGameWins.inc({ roomId: this.gameRoomId });

         
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
        roomRoundsPlayed.inc({ roomId: this.gameRoomId });

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
      else if (this.isFirstRound) this.setState("girlEntering");
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

      // Cap girl response length
      if (message.length > 800) {
        const cutoff = message.lastIndexOf(" ", 800);
        message = message.slice(0, cutoff > 0 ? cutoff : 800) + "…";
      }

      {
        const msgLen = message.length;
        const minDur = 4;
        const maxDur = 35;
        const base = 2;
        const cps = 20;
        const est = base + msgLen / cps;
        const clamped = Math.max(minDur, Math.min(est, maxDur));
        speakingDuration = Math.round(clamped * (0.9 + Math.random() * 0.2));
      }

      console.log(
        `💬 [Room ${this.gameRoomId}] Girl responding to ${player.name}: "${message}" (${speakingDuration}s)`
      );
    }

    let remainingSeconds = speakingDuration;

    let playerLeft = false;

    const tick = () => {
  // Check if player disconnected mid-speaking
  const stillActive = this.players.getActivePlayers().some((p) => p.name === player.name);
  if (!stillActive && !playerLeft) {
    playerLeft = true;
    console.log(`🚪 [Room ${this.gameRoomId}] ${player.name} left during their speaking phase`);

    if (!showingGirlResponse) {
      // Player was speaking — skip to girl response as "..." for 3s
      showingGirlResponse = true;
      message = "...";
      remainingSeconds = 3;
    } else if (remainingSeconds > 3) {
      // Girl was responding with time left — replace with "..." for 3s
      message = "...";
      remainingSeconds = 3;
    }
    // If girl response has <=3s left, let it finish naturally
  }

  let emotionToSend = "neutral";

  if (playerLeft) {
    emotionToSend = "neutral";
  } else if (!showingGirlResponse) {

    const halfPoint = Math.floor(speakingDuration / 2);

    if (remainingSeconds <= speakingDuration - halfPoint) {
      emotionToSend = player.latestGirlListeningEmotion;
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

          latestMessage: message,
          isGirlResponse: showingGirlResponse,

          timeLeft: remainingSeconds,
          girlEmotion: emotionToSend,
        },
      });

        if (remainingSeconds-- > 0) {
  this.timer = setTimeout(tick, 1000);
} else {

  if (playerLeft || player.latestMessage === "Player missed their turn") {
    showingGirlResponse = false;
    currentIndex++;
    speakNext();
    return;
  }

  if (!showingGirlResponse) {

    showingGirlResponse = true;
    speakNext();
  } else {
    // done with both phases, next player
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


  onPlayerSubmitted(player) {
    if (this.state !== "playersInputting") return;
    if (player.latestMessage === "Player missed their turn") return;
    if (this.pendingResponses.has(player.name)) return;

    const entry = { promise: null, result: null };

    entry.promise = processPlayerMessage(this.girl, player, this.gameRoomId)
      .then((result) => {
        entry.result = result;
        console.log(
          `⚡ [Room ${this.gameRoomId}] Early response ready for ${player.name}`
        );
        this.tryEndInputEarly();
      })
      .catch((err) => {
        console.error(`LLM error for ${player.name}:`, err);
        entry.result = {
          user: player.name,
          response: "...",
          listeningEmotion: "neutral",
          responseEmotion: "neutral",
        };
        this.tryEndInputEarly();
      });

    this.pendingResponses.set(player.name, entry);
  }

  tryEndInputEarly() {
    if (this.state !== "playersInputting") return;

    const activePlayers = this.players.getActivePlayers();
    if (activePlayers.length === 0) return;

    const allSubmitted = activePlayers.every((p) =>
      this.pendingResponses.has(p.name)
    );
    if (!allSubmitted) return;

    const allResolved = [...this.pendingResponses.values()].every(
      (e) => e.result !== null
    );
    if (!allResolved) return;

    console.log(
      `⚡ [Room ${this.gameRoomId}] All players ready, skipping timer`
    );
    clearTimeout(this.timer);
    this.setState("preparingPlayerSpeaking");
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
      roomResets.inc({ roomId: this.gameRoomId });
    } else {
      this.players.updateRanks(this.girl);

      this.broadcastWorld();
    }
  }
}
