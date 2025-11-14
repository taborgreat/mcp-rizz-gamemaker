
switch (section) {
    case "head":  global.playerHead = (global.playerHead + direction + global.playerHeadMax) mod 3; break;
    case "eyes":  global.playerEyes = (global.playerEyes + direction + global.playerHeadMax) mod 3; break;
    case "mouth": global.playerMouth = (global.playerMouth + direction + global.playerMouthMax) mod 3; break;
}

