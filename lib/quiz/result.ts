import "server-only";

import { characterById, rankOf, rarityForRank, type DeckCharacter } from "@/lib/deck";
import type { RarityId } from "@/lib/types";
import { open, seal } from "./seal";

/**
 * Sealed result payload, shared between the API route and the studio page.
 *
 * It lives here rather than in the route because Next only permits a fixed set
 * of exports from a route handler — exporting a helper alongside GET/POST is a
 * build error.
 */

export interface SealedResult {
  v: 2;
  id: number;
  affinity: number;
  readings: string[];
  drivers: string[];
}

export interface QuizResult {
  character: DeckCharacter;
  rank: number;
  rarity: RarityId;
  affinity: number;
  readings: string[];
  drivers: string[];
  token: string;
}

export function sealResult(payload: SealedResult): string {
  return seal(payload);
}

/** Rebuilds a full result from a token. Returns null if tampered or unknown. */
export function resultFromToken(token: string): QuizResult | null {
  const sealed = open<SealedResult>(token);
  if (!sealed || sealed.v !== 2) return null;

  const character = characterById(sealed.id);
  if (!character) return null;

  const rank = rankOf(character.id);
  return {
    character,
    rank,
    rarity: rarityForRank(rank),
    affinity: sealed.affinity,
    readings: sealed.readings ?? [],
    drivers: sealed.drivers ?? [],
    token,
  };
}
