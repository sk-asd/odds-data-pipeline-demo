import fs from "node:fs/promises";
import path from "node:path";
import { keyOf } from "./util.js";

const outDir = "out";
const snapshotPath = path.join(outDir, "snapshot.json");
const changesPath = path.join(outDir, "changes.json");

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

export async function saveSnapshot(rows) {
  await fs.mkdir(outDir, { recursive: true });

  const prev = await readJson(snapshotPath, []);
  const oldMap = new Map(prev.map((r) => [keyOf(r), r]));
  const nextMap = new Map();
  const changes = [];

  for (const r of rows) {
    const k = keyOf(r);
    const old = oldMap.get(k);
    nextMap.set(k, r);

    if (!old) {
      changes.push({ type: "new", key: k, row: r });
      continue;
    }

    if (old.value !== r.value) {
      changes.push({
        type: "price_change",
        key: k,
        from: old.value,
        to: r.value,
        row: r,
      });
    }
  }

  const deduped = [...nextMap.values()].sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
  await fs.writeFile(snapshotPath, JSON.stringify(deduped, null, 2));

  const history = await readJson(changesPath, []);
  history.push({ at: new Date().toISOString(), count: changes.length, changes });
  await fs.writeFile(changesPath, JSON.stringify(history, null, 2));

  return { snapshotPath, changesPath, rows: deduped.length, changes: changes.length };
}
