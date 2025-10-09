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
