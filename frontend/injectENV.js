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

// Inject volume control patch into GM's index.html (must load before Rizz.js)
const indexPath = "./GameMaker/build/index.html";
const volumePatch = `        <!-- Volume control: intercept AudioNode.connect before GM audio init -->
        <script>
        (function(){var o=AudioNode.prototype.connect,d=AudioNode.prototype.disconnect,g=null,c=null;function e(x){if(!g){c=x;g=x.createGain();o.call(g,x.destination);console.log("[Bridge] Volume gain node created")}return g}AudioNode.prototype.connect=function(t){if(t instanceof AudioDestinationNode)return o.call(this,e(this.context));return o.apply(this,arguments)};AudioNode.prototype.disconnect=function(t){if(t instanceof AudioDestinationNode&&g)return d.call(this,g);return d.apply(this,arguments)};window.setGameVolume=function(v){try{var x=c||window.g_WebAudioContext;if(!x)return;var n=e(x);var cl=Math.max(0,Math.min(1,v));n.gain.setValueAtTime(cl,x.currentTime)}catch(er){console.warn("[Bridge] setGameVolume failed:",er)}}})();
        </script>`;

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  if (!html.includes("setGameVolume")) {
    html = html.replace(
      /([\t ]*<!-- Run the game code -->)/,
      volumePatch + "\n\n$1"
    );
    fs.writeFileSync(indexPath, html);
    console.log("✅ Injected volume control patch into index.html");
  } else {
    console.log("ℹ️ Volume patch already present in index.html");
  }
} else {
  console.log("⚠️ Missing GM index.html at " + indexPath);
}

console.log("GameMaker build was injected with WS_SERVER variable!");
