import "server-only";

import { hexToHsl } from "@/lib/color";
import { DECK, rankOf, rarityForRank, type DeckCharacter } from "@/lib/deck";
import { Rng, hashString } from "@/lib/rng";
import type { RarityId } from "@/lib/types";
import { QUIZ, type QuizAnswers } from "./questions";

/**
 * Answers → one of the 500 characters.
 *
 * `import "server-only"` makes it a build error for any client component to pull
 * this in. That is the point: the questions ship to the browser, the scoring
 * table does not, so the outcome cannot be read out of the bundle and reverse
 * engineered into "answer these to get Gojo".
 *
 * Scoring is deterministic — the same answers always return the same character —
 * so a shared result stays stable and a retake is honest rather than a reroll.
 */

interface Effect {
  /** AniList genre affinities. */
  genres?: Record<string, number>;
  /** Substring matches against a character's theme tags. */
  tags?: Record<string, number>;
  /** Preferred popularity band, 0 (most famous) to 1 (deep cut). */
  obscurity?: number;
}

const EFFECTS: Record<string, Record<string, Effect>> = {
  wake: {
    "already-out": { genres: { Sports: 3, Action: 2 }, tags: { Training: 2 } },
    snooze: { genres: { Comedy: 3, "Slice of Life": 2 } },
    reading: { genres: { Mystery: 3, Psychological: 2 }, tags: { Strategy: 2 } },
    "never-slept": { genres: { "Sci-Fi": 2, Psychological: 3 } },
  },
  conflict: {
    charge: { genres: { Action: 4 }, tags: { Shounen: 2, "Super Power": 2 } },
    read: { genres: { Mystery: 3, Psychological: 3 }, tags: { Strategy: 3 } },
    shield: { genres: { Drama: 3, Action: 2 }, tags: { Tragedy: 2 } },
    vanish: { genres: { Thriller: 3, Supernatural: 2 }, tags: { Assassin: 3, Ninja: 2 } },
  },
  power: {
    fire: { genres: { Action: 3, Fantasy: 2 }, tags: { "Super Power": 3 } },
    machine: { genres: { "Sci-Fi": 4, Mecha: 4 }, tags: { Robot: 2 } },
    storm: { genres: { Action: 3 }, tags: { "Super Power": 2, Martial: 2 } },
    dark: { genres: { Supernatural: 3, Horror: 3 }, tags: { Demons: 3, Curse: 2 } },
  },
  weapon: {
    blade: { genres: { Action: 2 }, tags: { Swordplay: 4, Samurai: 2 } },
    fists: { genres: { Action: 2, Sports: 2 }, tags: { "Martial Arts": 4 } },
    spell: { genres: { Fantasy: 3 }, tags: { Magic: 4, Witch: 2 } },
    tech: { genres: { "Sci-Fi": 3, Mecha: 2 }, tags: { Guns: 3, Detective: 2 } },
  },
  drive: {
    promise: { genres: { Drama: 3 }, tags: { Tragedy: 2 } },
    proof: { genres: { Sports: 3, Action: 2 }, tags: { Rivalry: 3 } },
    protect: { genres: { Drama: 3, Action: 2 }, tags: { Family: 2 } },
    summit: { genres: { Adventure: 4 }, obscurity: 0.2 },
  },
  ground: {
    field: { genres: { Sports: 5 } },
    dojo: { genres: { Action: 2 }, tags: { "Martial Arts": 3, Samurai: 2 } },
    street: { genres: { Action: 2, Comedy: 2 }, tags: { Delinquent: 3, Urban: 2 } },
    library: { genres: { Mystery: 3, Psychological: 2, Fantasy: 2 }, tags: { Magic: 2 } },
  },
  company: {
    crew: { genres: { Adventure: 3, Comedy: 2 }, tags: { "Ensemble Cast": 3 } },
    one: { genres: { Romance: 3, Drama: 2 } },
    rival: { genres: { Sports: 2, Action: 2 }, tags: { Rivalry: 4 } },
    alone: { genres: { Psychological: 3, Thriller: 2 }, tags: { Antihero: 3 }, obscurity: 0.15 },
  },
  flaw: {
    temper: { genres: { Action: 3, Comedy: 2 }, tags: { Shounen: 2 } },
    overthinking: { genres: { Psychological: 4, Mystery: 2 } },
    softness: { genres: { Drama: 3, Romance: 2 } },
    secrets: { genres: { Thriller: 3, Mystery: 2 }, tags: { Antihero: 2 } },
  },
  world: {
    magic: { genres: { Fantasy: 5, "Mahou Shoujo": 2 }, tags: { Magic: 3 } },
    future: { genres: { "Sci-Fi": 5, Mecha: 3 } },
    ordinary: { genres: { "Slice of Life": 4, Romance: 2, Sports: 2 } },
    haunted: { genres: { Supernatural: 4, Horror: 3 }, tags: { Demons: 2, Ghost: 2 } },
  },
  stakes: {
    everything: { genres: { Drama: 3, Thriller: 2 }, tags: { Tragedy: 4 } },
    heart: { genres: { Romance: 4, Drama: 2 } },
    pride: { genres: { Sports: 4 }, tags: { Rivalry: 2 } },
    nothing: { genres: { "Slice of Life": 4, Comedy: 3 } },
  },
  quiet: {
    music: { genres: { Music: 5 } },
    food: { genres: { Comedy: 2, "Slice of Life": 3 }, tags: { Food: 4 } },
    train: { genres: { Sports: 3, Action: 2 }, tags: { Training: 3 } },
    think: { genres: { Psychological: 4, Supernatural: 2 } },
  },
  victory: {
    grin: { genres: { Adventure: 2, Comedy: 2 }, tags: { Shounen: 2 } },
    smirk: { genres: { Psychological: 2 }, tags: { Antihero: 2 } },
    nothing: { genres: { Action: 2, Thriller: 2 }, tags: { Stoic: 2 } },
    tears: { genres: { Drama: 3, Sports: 2 } },
  },
  pace: {
    relentless: { genres: { Action: 4, Adventure: 2 } },
    funny: { genres: { Comedy: 5 } },
    slow: { genres: { "Slice of Life": 4, Romance: 2 } },
    tense: { genres: { Thriller: 4, Horror: 2, Psychological: 2 } },
  },
};

/** Named swatches for the two colour questions, by option id. */
const SWATCHES: Record<string, string> = {
  crimson: "#d7263d",
  orange: "#f06a25",
  gold: "#f2c14e",
  green: "#3fa34d",
  teal: "#1ea0a6",
  blue: "#2d5fd8",
  violet: "#7b4ddb",
  pink: "#f06ba8",
  white: "#eceaf2",
  black: "#1b1a22",
  brown: "#8a5a3b",
  silver: "#9aa3b2",
};

const TONE_TARGET: Record<string, number> = { bright: 0.68, balanced: 0.48, dark: 0.3 };

/**
 * Perceptual-ish distance between two colours, 0 (identical) to 1.
 *
 * Hue is weighted hardest but only when both colours are actually saturated —
 * comparing the hue of two near-greys is meaningless, and without that guard
 * "Snow" would match a saturated blue as readily as a white.
 */
function colourDistance(a: string, b: string): number {
  const x = hexToHsl(a);
  const y = hexToHsl(b);

  const satWeight = Math.min(x.s, y.s) / 100;
  let hue = Math.abs(x.h - y.h);
  if (hue > 180) hue = 360 - hue;

  const hueTerm = (hue / 180) * satWeight;
  const satTerm = Math.abs(x.s - y.s) / 100;
  const lightTerm = Math.abs(x.l - y.l) / 100;

  return Math.min(1, hueTerm * 0.6 + satTerm * 0.15 + lightTerm * 0.35);
}

/** Best match between a chosen colour and any of the character's three tones. */
function paletteScore(choice: string, palette: string[]): number {
  if (!palette.length) return 0;
  const best = Math.min(...palette.map((tone) => colourDistance(choice, tone)));
  return 1 - best;
}

export interface MatchResult {
  character: DeckCharacter;
  rank: number;
  rarity: RarityId;
  /** 0–100, how strongly the answers pointed here. */
  affinity: number;
  readings: string[];
  /** Genres that drove the match, strongest first. */
  drivers: string[];
}

export function matchCharacter(answers: QuizAnswers): MatchResult {
  const signature = QUIZ.map((q) => `${q.id}:${answers[q.id] ?? ""}`).join("|");
  const rng = new Rng(`match-${hashString(signature)}`);

  const genreWeights = new Map<string, number>();
  const tagWeights = new Map<string, number>();
  let obscurity = 0;
  let obscurityVotes = 0;

  for (const question of QUIZ) {
    const choice = answers[question.id];
    if (!choice) continue;
    const effect = EFFECTS[question.id]?.[choice];
    if (!effect) continue;

    for (const [genre, weight] of Object.entries(effect.genres ?? {})) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + weight);
    }
    for (const [tag, weight] of Object.entries(effect.tags ?? {})) {
      tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + weight);
    }
    if (effect.obscurity !== undefined) {
      obscurity += effect.obscurity;
      obscurityVotes += 1;
    }
  }

  const signatureColour = SWATCHES[answers.signature] ?? SWATCHES.blue;
  const accentColour = SWATCHES[answers.accent] ?? SWATCHES.gold;
  const toneTarget = TONE_TARGET[answers.tone] ?? 0.5;
  const obscurityTarget = obscurityVotes ? obscurity / obscurityVotes : 0;

  const genreTotal = [...genreWeights.values()].reduce((a, b) => a + b, 0) || 1;
  const tagTotal = [...tagWeights.values()].reduce((a, b) => a + b, 0) || 1;

  let best: { character: DeckCharacter; score: number; rank: number } | null = null;

  DECK.forEach((character, rank) => {
    let genreScore = 0;
    for (const genre of character.genres) genreScore += genreWeights.get(genre) ?? 0;
    genreScore /= genreTotal;

    let tagScore = 0;
    for (const [tag, weight] of tagWeights) {
      // Substring, because AniList tags are phrases ("Martial Arts", "Male Protagonist").
      if (character.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) {
        tagScore += weight;
      }
    }
    tagScore /= tagTotal;

    const colourScore =
      paletteScore(signatureColour, character.palette) * 0.65 +
      paletteScore(accentColour, character.palette) * 0.35;

    const toneScore = 1 - Math.abs(character.brightness - toneTarget);

    // Popularity: by default favour the famous, but an "obscurity" answer pulls
    // the window deeper into the deck.
    const normalisedRank = rank / DECK.length;
    const popularityScore = 1 - Math.abs(normalisedRank - obscurityTarget);

    const score =
      genreScore * 3.2 +
      tagScore * 2.4 +
      colourScore * 2.0 +
      toneScore * 0.9 +
      popularityScore * 0.8 +
      // Tiny deterministic jitter so near-ties do not always resolve to the
      // lowest index, which would make the same few characters dominate.
      rng.float() * 0.12;

    if (!best || score > best.score) best = { character, score, rank };
  });

  const winner = best!;

  // How strongly the answers pointed here, 0-100.
  const affinity = Math.round(Math.min(99, 54 + winner.score * 9));

  const topGenres = [...genreWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  return {
    character: winner.character,
    rank: winner.rank,
    rarity: rarityForRank(winner.rank),
    affinity,
    drivers: topGenres,
    readings: buildReadings(winner.character, winner.rank, topGenres, answers),
  };
}

function buildReadings(
  character: DeckCharacter,
  rank: number,
  genres: string[],
  answers: QuizAnswers,
): string[] {
  const shared = character.genres.filter((genre) => genres.includes(genre));
  const toneWord = answers.tone === "dark" ? "shadow" : answers.tone === "bright" ? "light" : "both light and shadow";

  return [
    shared.length
      ? `Your answers pointed hard at ${shared.join(", ").toLowerCase()} — and so does ${character.name}.`
      : `Your answers pointed at ${genres.join(", ").toLowerCase()}.`,
    `${character.name} comes from ${character.series}${character.year ? ` (${character.year})` : ""}.`,
    `You chose ${toneWord}, which matches the palette of their artwork.`,
    rank < 10
      ? `They are one of the ten most-loved characters in the whole deck — ${character.favourites.toLocaleString("en-US")} favourites.`
      : `Ranked #${rank + 1} of ${DECK.length} by favourites, with ${character.favourites.toLocaleString("en-US")} of them.`,
  ];
}

export { rankOf };
