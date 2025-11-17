#!/usr/bin/env node
/**
 * Builds the 500-character deck from AniList.
 *
 *   npm run deck
 *
 * No credentials: AniList's GraphQL API is public and unauthenticated. Only
 * metadata is written to disk — images stay on AniList's CDN and are hot-linked,
 * so nothing copyrighted is copied into this repository.
 *
 * Re-run to refresh. The output is deterministic for a given popularity ranking.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ENDPOINT = "https://graphql.anilist.co";
const OUT = path.join(process.cwd(), "data", "characters.json");
const TARGET = Number(process.argv.includes("--count")
  ? process.argv[process.argv.indexOf("--count") + 1]
  : 500);
const PER_PAGE = 50;

const QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    characters(sort: FAVOURITES_DESC) {
      id
      name { full native }
      image { large }
      gender
      age
      favourites
      description(asHtml: false)
      media(perPage: 1, sort: POPULARITY_DESC) {
        nodes {
          title { romaji english }
          format
          seasonYear
          genres
          tags { name rank isGeneralSpoiler }
        }
      }
    }
  }
}`;

/** AniList descriptions carry markdown and spoiler markup. */
function cleanDescription(raw) {
  if (!raw) return "";
  return raw
    .replace(/~!.*?!~/gs, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/__|\*\*|~~|\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

/**
 * Dominant palette for a character's artwork.
 *
 * AniList carries no structured appearance data — no hair colour, no eye colour
 * — so the only honest way to make a colour question match a real character is
 * to read the colours out of their actual art. Pixels are bucketed into a coarse
 * RGB grid and the busiest buckets win; near-white and near-black are dropped
 * because almost every portrait is mostly background and line art.
 */
async function extractPalette(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const source = Buffer.from(await response.arrayBuffer());

    const { data, info } = await sharp(source)
      .resize(48, 48, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const buckets = new Map();
    let luminanceTotal = 0;
    let counted = 0;

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      luminanceTotal += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      counted += 1;

      // Drop washed-out and near-black pixels: they are background and ink.
      if (max < 38 || min > 228 || max - min < 22) continue;

      const key = `${r >> 5}|${g >> 5}|${b >> 5}`;
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
      buckets.set(key, bucket);
    }

    const top = [...buckets.values()]
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map((bucket) => {
        const hex = (v) => Math.round(v / bucket.n).toString(16).padStart(2, "0");
        return `#${hex(bucket.r)}${hex(bucket.g)}${hex(bucket.b)}`;
      });

    if (top.length === 0) return null;
    return { palette: top, brightness: Number((luminanceTotal / Math.max(counted, 1)).toFixed(3)) };
  } catch {
    return null;
  }
}

/** Bounded worker pool — 500 sequential image fetches would take far too long. */
async function pool(items, size, worker) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        await worker(items[index], index);
      }
    }),
  );
}

async function fetchPage(page, attempt = 0) {
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { page, perPage: PER_PAGE } }),
    });
  } catch (error) {
    // Transient connect/reset failures are common on flaky links; a whole
    // 500-character fetch should not be lost to one dropped socket.
    if (attempt >= 4) throw error;
    const backoff = 2 ** attempt * 1500;
    console.log(`\n  network error on page ${page}, retrying in ${backoff / 1000}s…`);
    await new Promise((resolve) => setTimeout(resolve, backoff));
    return fetchPage(page, attempt + 1);
  }

  // AniList returns 429 with a Retry-After when the window is exhausted.
  if (response.status === 429) {
    const wait = Number(response.headers.get("retry-after") ?? 60);
    console.log(`  rate limited, waiting ${wait}s…`);
    await new Promise((resolve) => setTimeout(resolve, (wait + 1) * 1000));
    return fetchPage(page, attempt);
  }

  if (!response.ok) throw new Error(`AniList responded ${response.status}`);
  const body = await response.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data.Page;
}

async function main() {
  const characters = [];
  let page = 1;

  while (characters.length < TARGET) {
    process.stdout.write(`Fetching page ${page} (${characters.length}/${TARGET})…\r`);
    const data = await fetchPage(page);

    for (const entry of data.characters) {
      const media = entry.media?.nodes?.[0];
      // Skip anyone with no image or no source series — they cannot be shown.
      if (!entry.image?.large || !media) continue;

      characters.push({
        id: entry.id,
        name: entry.name.full,
        native: entry.name.native ?? null,
        image: entry.image.large,
        gender: entry.gender ?? null,
        age: entry.age ?? null,
        favourites: entry.favourites ?? 0,
        description: cleanDescription(entry.description),
        series: media.title.english || media.title.romaji,
        format: media.format ?? null,
        year: media.seasonYear ?? null,
        genres: media.genres ?? [],
        // Spoiler tags are excluded; a quiz result should not spoil the show.
        tags: (media.tags ?? [])
          .filter((tag) => !tag.isGeneralSpoiler && tag.rank >= 60)
          .slice(0, 8)
          .map((tag) => tag.name),
      });

      if (characters.length >= TARGET) break;
    }

    if (!data.pageInfo.hasNextPage) break;
    page += 1;
    // Stay well inside the published rate limit.
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  console.log("\nReading palettes from artwork…");
  let done = 0;
  await pool(characters, 8, async (character) => {
    const result = await extractPalette(character.image);
    character.palette = result?.palette ?? ["#888888"];
    character.brightness = result?.brightness ?? 0.5;
    done += 1;
    if (done % 50 === 0) process.stdout.write(`  ${done}/${characters.length}\r`);
  });

  const payload = {
    source: "AniList (https://anilist.co)",
    note: "Metadata only. Images are hot-linked from AniList's CDN and remain the property of their respective rights holders.",
    fetchedAt: new Date().toISOString(),
    count: characters.length,
    characters,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 1)}\n`, "utf8");
  console.log(`\nWrote ${characters.length} characters to data/characters.json`);

  const series = new Set(characters.map((c) => c.series));
  const genres = new Set(characters.flatMap((c) => c.genres));
  console.log(`  ${series.size} series · ${genres.size} genres`);
  console.log(`  top: ${characters.slice(0, 5).map((c) => c.name).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
