export function getUniqueName(base, existing) {
  let name = base;
  while (existing.includes(name)) {
    const rand = Math.floor(Math.random() * 9) + 1;
    name = `${base}${rand}`;
  }
  return name;
}
