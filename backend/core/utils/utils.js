export function getUniqueName(base, existing) {
  const upperExisting = existing.map((n) => n.toUpperCase());
  let name = base;
  let attempt = 1;

  while (upperExisting.includes(name.toUpperCase())) {
    const rand = Math.floor(Math.random() * 10);
    name = `${base}${rand}`;
    attempt++;

    if (attempt > 1000) break;
  }

  return name;
}
