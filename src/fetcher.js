import fs from "node:fs/promises";
import { sleep } from "./util.js";

const feeds = [
  { name: "mock-a", file: "mock/feed-a.json" },
  { name: "mock-b", file: "mock/feed-b.json" },
  { name: "mock-c", file: "mock/feed-c.json" },
];

async function retry(label, fn, max = 3) {
  let last;
  for (let i = 1; i <= max; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const wait = i * 300 + Math.floor(Math.random() * 200);
      console.warn(`[retry] ${label} ${i}/${max}, ${wait}ms`);
      await sleep(wait);
    }
  }
  throw last;
}

export async function fetchFeeds() {
  const out = [];

  for (const feed of feeds) {
    const data = await retry(feed.name, async () => {
      const raw = await fs.readFile(feed.file, "utf8");
      return JSON.parse(raw);
    });
    out.push({ name: feed.name, data });
  }

  return out;
}
