# Rizz (name needs update)

**Rizz** is a multiplayer social AI game powered by **MCP (Model Context Protocol)**.

![Game Concept Photo](./concept.png)

2–4 players compete in real time to win over the affection of the **AI girl** in the center of the scene.  
Each player takes turns trying to “rizz” (charm or flirt with) the girl through clever dialogue.

She **remembers** what you say, **responds dynamically**, and **moves toward** the player she feels the strongest connection with.  
The first player to fully attract her **wins**.

---

## Game Overview

**Genre:** Social AI Party Game  
**Players:** 2–4  
**Goal:** Use your words to build attraction with the girl in the middle before your opponents do.

### Gameplay Loop

1. Players take their turn sending a message to the girl.
2. The girl replies using her own AI-generated logic, remembering context and past interactions.
3. Based on her perception (emotion, style, tone, memory), she moves closer to the player she’s most interested in.
4. When she reaches a player, that player wins the game.

This is a mix of **humor**, **charm**, and **emergent AI personality** — no two games are ever the same.

---

## Project Setup

### Installation

Clone the repository, duplicate `.env.example` as `.env` (and fill custom variables if want), and then type:

```bash
npm install
npm run start
```

---

## Technical Architecture

### HTML IFrame — GameMaker

- Handles **graphics**, **animation**, and **input**.
- Displays the girl and player avatars in a dynamic scene.
- Connects to a Node.js backend via **WebSocket** for real-time multiplayer updates.

**Listens for:**

- Players connected
- Girl’s position updates
- Dialogue and chat messages from girl

**Sends:**

- Player join (name)
- Player messages

---

### Web Integration — React + GameMaker Bridge

The **GameMaker HTML5 export** runs inside an **iframe**, which is **wrapped and managed by a React frontend**.  
This setup allows the game to blend traditional **GameMaker rendering** with modern **responsive web design** and **interactive GUI components**.



#### Responsibilities

**React Layer**

- Provides the **webpage structure** and **responsive GUI** (buttons, menus, overlays, etc.).  
- Hosts the **GameMaker canvas** inside an `<iframe>` component.  
- Listens to and emits messages through **WebSocket** to synchronize state with the backend.  

**GameMaker Layer**

- Handles **game visuals**, **animations**, and **in-world interactions**.  
- Exposes **JavaScript functions** (like `gmcallback_*`) that React can call directly for **real-time updates**.  



#### Communication Bridge

**WebSocket (shared channel)**  

- Used for **multiplayer synchronization** between **React**, **GameMaker**, and the **Node.js** backend.  
- Keeps all clients updated on **chat**, **turns**, and **game state**.  

**Direct JS Calls**

- React can trigger GameMaker events using functions such as  
  `window.gml_Script_gmcallback_handleSocketClosed()` or similar callbacks defined in the HTML5 export.  
- GameMaker can also call React functions or update DOM elements when necessary through `html_*` or **JS bridge functions**.  



Together, these layers create a **hybrid architecture** where **React** manages the **outer experience** and **GameMaker** delivers the **core gameplay**, allowing a seamless, visually rich, and adaptive web experience.

---

### Backend — Node.js WebSocket Server

- Manages **player sessions** and **real-time game state**.
- Handles:
  - Player connections/disconnections
  - Message history
  - Turn sequencing
    --Passes GameState to GameMaker client regularly to sync clients
- Communicates with the **MCP server** for AI-driven decision-making.

---

### MCP Client/Server — LLM Logic Core

Powered by **Model Context Protocol (MCP)** for advanced contextual reasoning.

**Responsibilities:**

- The girl’s dialogue generation
- Attraction scoring to determine who she moves toward
- Deciding who to move towards that turn

Returns structured data back to Node.js, for example:

```json
{
  "responseText": "You seem really sweet when you talk like that.",
  "moveTarget": "player2"
}
```

---

## Developer Note

This is **Tabor and Salem Holly’s first test** combining **MCP**, **LLMs**, and **gaming** —  
an early experiment exploring how large language models can power dynamic, emotional, and adaptive gaming experiences.
