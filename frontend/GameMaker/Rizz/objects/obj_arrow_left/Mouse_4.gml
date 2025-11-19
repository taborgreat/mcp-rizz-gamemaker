
switch (section) {
    case "head":  global.playerHead = (global.playerHead + direction + global.playerHeadMax) mod 4; break;
    case "face":  global.playerFace = (global.playerFace + direction + global.playerFaceMax) mod 4; break;
    case "mouth": global.playerMouth = (global.playerMouth + direction + global.playerMouthMax) mod 4; break;
}

