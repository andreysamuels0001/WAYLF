/**
 * The character data model.
 *
 * Trait ids are string literal unions on purpose: the SVG renderer switches on
 * them, so adding a trait to a catalog without drawing it becomes a type error
 * rather than a silently blank layer.
 */

export type RarityId = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export type BuildId = "lean" | "athletic" | "powerhouse";

export type PoseId =
  | "ready-stance"
  | "arms-crossed"
  | "blade-draw"
  | "power-up"
  | "point-forward"
  | "relaxed";

export type HairFrontId =
  | "spike-crown"
  | "swept-bangs"
  | "blunt-bangs"
  | "messy-shag"
  | "slick-back"
  | "twin-lock"
  | "wolf-cut"
  | "tight-pull"
  | "braided-crown"
  | "horn-spikes"
  | "curtain-part"
  | "cropped-buzz";

export type HairBackId =
  | "none"
  | "short-nape"
  | "long-straight"
  | "long-wavy"
  | "high-tail"
  | "twin-tails"
  | "long-braid";

export type EyeId =
  | "determined"
  | "fierce"
  | "gentle"
  | "sharp"
  | "wide"
  | "half-lid"
  | "glowing"
  | "scarred";

export type BrowId = "straight" | "angled" | "soft" | "furrowed";

export type MouthId = "neutral" | "smirk" | "grin" | "shout" | "stoic";

export type OutfitId =
  | "training-gi"
  | "shadow-vest"
  | "captain-coat"
  | "court-jersey"
  | "slayer-haori"
  | "survey-harness"
  | "academy-robe"
  | "pilot-suit"
  | "reaper-shihakusho"
  | "hunter-jacket";

export type AccessoryId =
  | "none"
  | "forehead-plate"
  | "weighted-scarf"
  | "eye-scar"
  | "earrings"
  | "straw-hat-cord"
  | "sweatband"
  | "shoulder-pauldron"
  | "spirit-beads"
  | "oni-horns"
  | "visor"
  | "bandage-wrap"
  | "collar-cape";

export type AuraId =
  | "none"
  | "ki-flare"
  | "ember-drift"
  | "frost-shards"
  | "storm-arcs"
  | "void-ribbons"
  | "petal-swirl"
  | "spirit-wisps";

export type BackdropId =
  | "radial-glow"
  | "impact-lines"
  | "rising-sun"
  | "grid-horizon"
  | "ink-wash"
  | "shattered-ring"
  | "bamboo-rain"
  | "void-rift";

export type ElementId =
  | "flame"
  | "frost"
  | "storm"
  | "shadow"
  | "radiance"
  | "verdant"
  | "tide"
  | "quake"
  | "gale"
  | "void"
  | "blossom"
  | "ironclad";

export type UniverseId =
  | "crimson-ki"
  | "shadow-leaf"
  | "grand-tide"
  | "hardcourt"
  | "oni-edge"
  | "bastion-wall"
  | "arcanum"
  | "steel-dawn"
  | "soul-ledger"
  | "hunter-ascent";

/** Everything the renderer needs. Fully serialisable — this is what a seed encodes. */
export interface TraitSet {
  universe: UniverseId;
  archetype: string;
  element: ElementId;
  build: BuildId;
  pose: PoseId;
  hairFront: HairFrontId;
  hairBack: HairBackId;
  eyes: EyeId;
  brows: BrowId;
  mouth: MouthId;
  outfit: OutfitId;
  accessory: AccessoryId;
  aura: AuraId;
  backdrop: BackdropId;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  outfitPrimary: string;
  outfitAccent: string;
  auraColor: string;
}

export type TraitKey = keyof TraitSet;

/** Trait keys the studio exposes as colour pickers. */
export const COLOR_TRAIT_KEYS = [
  "hairColor",
  "eyeColor",
  "skinColor",
  "outfitPrimary",
  "outfitAccent",
  "auraColor",
] as const satisfies readonly TraitKey[];

export type ColorTraitKey = (typeof COLOR_TRAIT_KEYS)[number];

export interface Stats {
  power: number;
  speed: number;
  technique: number;
  spirit: number;
  endurance: number;
}

export type StatKey = keyof Stats;

export const STAT_KEYS = ["power", "speed", "technique", "spirit", "endurance"] as const;

export interface Character {
  /** Stable id — the normalised seed. */
  id: string;
  seed: string;
  name: string;
  /** The "Crimson Fist of the Ninth Gate" line under the name. */
  epithet: string;
  traits: TraitSet;
  rarity: RarityId;
  stats: Stats;
  /** Headline number on the card. Derived from stats + rarity. */
  combatRating: number;
  quote: string;
}

/** A saved entry in the user's local collection. */
export interface CollectedCharacter {
  character: Character;
  savedAt: number;
}
