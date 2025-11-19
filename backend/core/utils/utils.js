const MAX_PLAYER_HEAD = 4;

const MAX_PLAYER_FACE = 4;
const MAX_PLAYER_MOUTH = 4;

export function getUniqueName(base, existing) {
  const upperExisting = existing.map((n) => n.toUpperCase());

  let current = base;

  const match = base.match(/^(.*?)(\d+)$/);
  let prefix = match ? match[1] : base;
  let number = match ? parseInt(match[2], 10) : 0;

  if (!match) number = 1;

  let attempt = 0;

  while (upperExisting.includes(current.toUpperCase()) && attempt < 100) {
    number++;
    current = `${prefix}${number}`;
    attempt++;
  }

  return current;
}

export function sanitizeMessage(input) {
  if (!input || typeof input !== "string") return "";

  const badWords = [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "dick",
    "slut",
    "faggot",
    "fag",
    "nigger",
    "pussy",
    "retard",
    "whore",
  ];

  let clean = input
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width chars
    .replace(/<[^>]*>/g, "") // remove any HTML tags
    .replace(/[<>]/g, "") // remove stray symbols
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9!@#$%^&*()+\-="'":,.?;_%~{}\[\] /]/g, "")
    .replace(/([!@#$%^&*()+\-="'":,./?;_%~{}\[\]])\1+/g, "$1");

  for (const word of badWords) {
    const regex = new RegExp(word, "gi");
    clean = clean.replace(regex, "*".repeat(word.length));
  }

  return clean;
}

export function sanitizeHtmlOnly(input) {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/<[^>]*>/g, "") // remove tags like <b>, <script>, etc.
    .replace(/[<>]/g, "") // remove leftover HTML special chars
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9!@#$%^&*()+\-="'":,.?;_%~{}\[\] /]/g, "")
    .replace(/([!@#$%^&*()+\-="'":,./?;_%~{}\[\]])\1+/g, "$1");
}

export function randomIndex(max) {
  return Math.floor(Math.random() * max);
}

export function normalizeStyle(raw) {
  // If string → parse
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    raw = Object.keys(raw)
      .sort((a, b) => a - b)
      .map((k) => raw[k]);
  }

  if (!Array.isArray(raw)) {
    return [
      randomIndex(MAX_PLAYER_HEAD),
      randomIndex(MAX_PLAYER_FACE),
      randomIndex(MAX_PLAYER_MOUTH),
    ];
  }

  let [head, face, mouth] = raw;

  // HEAD
  if (typeof head !== "number" || head < 0 || head >= MAX_PLAYER_HEAD) {
    head = randomIndex(MAX_PLAYER_HEAD);
  }

  // FACE
  if (typeof face !== "number" || face < 0 || face >= MAX_PLAYER_FACE) {
    face = randomIndex(MAX_PLAYER_FACE);
  }

  // MOUTH
  if (typeof mouth !== "number" || mouth < 0 || mouth >= MAX_PLAYER_MOUTH) {
    mouth = randomIndex(MAX_PLAYER_MOUTH);
  }

  return [head, face, mouth];
}
