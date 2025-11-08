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
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .normalize("NFKC");

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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .normalize("NFKC");
}
