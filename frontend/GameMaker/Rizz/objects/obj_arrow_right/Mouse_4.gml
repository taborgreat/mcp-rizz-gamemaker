
switch (section) {
    case "head":  global.playerHead = (global.playerHead + direction + 4) mod 4; break;
    case "face":  global.playerFace = (global.playerFace + direction + 4) mod 4; break;
    case "mouth": global.playerMouth = (global.playerMouth + direction + 4) mod 4; break;
}
with (obj_playerFace) update_sprite();
