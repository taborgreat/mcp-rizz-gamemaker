
switch (section) {
    case "head":  global.playerHead = (global.playerHead + direction + 3) mod 3; break;
    case "eyes":  global.playerEyes = (global.playerEyes + direction + 3) mod 3; break;
    case "mouth": global.playerMouth = (global.playerMouth + direction + 3) mod 3; break;
}
with (obj_playerFace) update_sprite();
