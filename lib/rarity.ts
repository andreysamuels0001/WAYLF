import type { RarityId } from "./types";

export interface RarityTier {
  id: RarityId;
  label: string;
  /** Pull weight. Mythic is deliberately brutal — it should feel like a find. */
  weight: number;
  /** Card frame gradient stops, outer to inner. */
  frame: [string, string, string];
  /** Glow colour behind the card. */
  glow: string;
  /** 0–1. Drives foil sweep opacity, sparkle count, and aura intensity. */
  shine: number;
  /** Multiplies derived stats so higher tiers genuinely read stronger. */
  statMultiplier: number;
  blurb: string;
}

export const RARITY_TIERS: readonly RarityTier[] = [
  {
    id: "common",
    label: "Common",
    weight: 42,
    frame: ["#5b6476", "#8c97ab", "#434b5c"],
    glow: "#8c97ab",
    shine: 0.1,
    statMultiplier: 0.84,
    blurb: "Academy intake. Raw, unproven, hungry.",
  },
  {
    id: "uncommon",
    label: "Uncommon",
    weight: 26,
    frame: ["#2f7d5d", "#58d6a0", "#1d5440"],
    glow: "#58d6a0",
    shine: 0.22,
    statMultiplier: 0.92,
    blurb: "Field-tested. Has survived a real arc.",
  },
  {
    id: "rare",
    label: "Rare",
    weight: 16,
    frame: ["#2456a8", "#5ba8ff", "#163a72"],
    glow: "#5ba8ff",
    shine: 0.38,
    statMultiplier: 1,
    blurb: "Squad-level threat. Named in the opening credits.",
  },
  {
    id: "epic",
    label: "Epic",
    weight: 9.5,
    frame: ["#6b2bb5", "#b98bff", "#44197a"],
    glow: "#b98bff",
    shine: 0.56,
    statMultiplier: 1.08,
    blurb: "Arc antagonist calibre. Bends the plot around them.",
  },
  {
    id: "legendary",
    label: "Legendary",
    weight: 5,
    frame: ["#b1700d", "#ffd166", "#7a4a05"],
    glow: "#ffd166",
    shine: 0.76,
    statMultiplier: 1.17,
    blurb: "Generational talent. The ceiling everyone measures against.",
  },
  {
    id: "mythic",
    label: "Mythic",
    weight: 1.5,
    frame: ["#b8143f", "#ff6ba6", "#6d0a26"],
    glow: "#ff6ba6",
    shine: 1,
    statMultiplier: 1.28,
    blurb: "Spoken of in flashbacks only. Should not exist.",
  },
];

export const RARITY_BY_ID: Record<RarityId, RarityTier> = Object.fromEntries(
  RARITY_TIERS.map((tier) => [tier.id, tier]),
) as Record<RarityId, RarityTier>;

export const RARITY_ORDER: Record<RarityId, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

export const RARITY_WEIGHTS = RARITY_TIERS.map((tier) => ({
  value: tier.id,
  weight: tier.weight,
}));
