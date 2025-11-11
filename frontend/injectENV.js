import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("../.env") });

const pairs = [
  {
    template: "./GameMaker/Rizz/bridgeExtensionTemplate.js",
    output:
      "./GameMaker/Rizz/extensions/js_websocket_bridge/bridgeExtension.js",
  },
  {
    template: "./GameMaker/Rizz/bridgeExtensionTemplate.js",
    output: "./GameMaker/build/html5game/uph_bridgeExtension.js",
  },
];

for (const { template, output } of pairs) {
  if (fs.existsSync(template)) {
    let src = fs.readFileSync(template, "utf8");

    src = src.replace(/__WS_SERVER_URI__/g, process.env.WS_SERVER_URL);

    fs.writeFileSync(output, src);
    console.log(`✅ Injected env vars into ${output}`);
  } else {
    console.log(`⚠️ Missing template: ${template}`);
  }
}

console.log("GameMaker build was injected with WS_SERVER variable!");
