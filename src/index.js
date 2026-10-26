import { fetchFeeds } from "./fetcher.js";
import { normalize } from "./normalize.js";
import { saveSnapshot } from "./store.js";
import { sleep } from "./util.js";

async function runOnce() {
  const feeds = await fetchFeeds();
  const rows = feeds.flatMap(normalize).filter((r) => r.value);
  const saved = await saveSnapshot(rows);

  console.log(`feeds: ${feeds.length}`);
  console.log(`normalized rows: ${rows.length}`);
  console.log(`snapshot rows: ${saved.rows}`);
  console.log(`changes: ${saved.changes}`);
  console.log(`saved ${saved.snapshotPath}`);
  console.log(`saved ${saved.changesPath}`);
}

async function main() {
  const once = process.argv.includes("--once");

  do {
    await runOnce();
    if (once) break;
    await sleep(5000);
  } while (true);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
