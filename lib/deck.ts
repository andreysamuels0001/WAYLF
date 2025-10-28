import deck from "@/data/characters.json";
import type { RarityId } from "./types";

/**
 * The character deck.
 *
 * 500 real anime characters, pulled from AniList by `npm run deck`. Only
 * metadata lives in this repository — artwork is hot-linked from AniList's CDN
 * and remains the property of its rights holders.
 *
 * Nothing here is generated, so the app needs no API key, no model and no
 * per-result cost: the deck is already built by the time the page loads.
 */

export interface DeckCharacter {
  id: number;
  name: string;
  native: string | null;
  image: string;
  gender: string | null;
  age: string | null;
  favourites: number;
  description: string;
  series: string;
  format: string | null;
  year: number | null;
  genres: string[];
  tags: string[];
  /** Three dominant colours read from the character's own artwork. */
  palette: string[];
  /** Mean luminance of the artwork, 0–1. */
  brightness: number;
}

interface DeckFile {
  source: string;
  note: string;
  fetchedAt: string;
  count: number;
  characters: DeckCharacter[];
}

const file = deck as unknown as DeckFile;

export const DECK: readonly DeckCharacter[] = file.characters;
export const DECK_SIZE = DECK.length;
export const DECK_SOURCE = file.source;
export const DECK_FETCHED_AT = file.fetchedAt;

/**
 * Rarity from popularity rank.
 *
 * The deck arrives sorted by favourites, so rank *is* the tier. Deriving rarity
 * rather than storing it means a deck refresh re-tiers automatically: a
 * character who climbs into the top ten becomes Mythic without a code change.
 */
const TIER_CUTOFFS: [number, RarityId][] = [
  [10, "mythic"],
  [30, "legendary"],
  [70, "epic"],
  [150, "rare"],
  [300, "uncommon"],
  [Infinity, "common"],
];

export function rarityForRank(rank: number): RarityId {
  return TIER_CUTOFFS.find(([limit]) => rank < limit)![1];
}

const RANK_BY_ID = new Map(DECK.map((character, index) => [character.id, index]));

export function rankOf(id: number): number {
  return RANK_BY_ID.get(id) ?? DECK.length - 1;
}

export function rarityOf(character: DeckCharacter): RarityId {
  return rarityForRank(rankOf(character.id));
}

export function characterById(id: number): DeckCharacter | undefined {
  const rank = RANK_BY_ID.get(id);
  return rank === undefined ? undefined : DECK[rank];
}

/** Every genre present in the deck, most common first. */
export function allGenres(): string[] {
  const counts = new Map<string, number>();
  for (const character of DECK) {
    for (const genre of character.genres) counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([genre]) => genre);
}

/** Every series present in the deck, by how many characters it contributes. */
export function allSeries(): { series: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const character of DECK) counts.set(character.series, (counts.get(character.series) ?? 0) + 1);
  return [...counts.entries()]
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count || a.series.localeCompare(b.series));
}
