export function getUniqueName(base, existing) {
  const upperExisting = existing.map((n) => n.toUpperCase());
  let name = base;
  let attempt = 0;

  while (upperExisting.includes(name.toUpperCase()) && attempt < 100) {
    attempt++;
    name = `${base}${attempt}`;
  }

  return name;
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
