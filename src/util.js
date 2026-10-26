export function sleep(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}

export function roundOdd(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
}

export function fracToDecimal(v) {
  if (typeof v !== "string" || !v.includes("/")) return roundOdd(v);
  const [a, b] = v.split("/").map(Number);
  if (!a || !b) return null;
  return roundOdd(a / b + 1);
}

export function keyOf(row) {
  return [
    row.matchId,
    row.bookmaker,
    row.market,
    row.selection,
    row.line ?? "",
  ].join("|");
}
