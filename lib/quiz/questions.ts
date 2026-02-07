/**
 * The questionnaire — client-safe.
 *
 * This file ships to the browser because the questions have to be displayed.
 * It deliberately contains NO mapping from answers to characters: that lives in
 * `match.ts`, which is server-only. Someone reading the client bundle sees the
 * questions and nothing about which answers produce which character.
 *
 * Questions are written against data the deck actually has — genres, themes and
 * the palette read from each character's own artwork. Asking "what colour are
 * your eyes" would be unanswerable, because AniList carries no such field.
 */

export type QuestionKind = "choice" | "colour";

export interface QuizOption {
  id: string;
  label: string;
  /** Short supporting line under the label. */
  hint?: string;
  /** Swatch for colour questions. Showing a colour reveals nothing about the mapping. */
  swatch?: string;
  /** Decorative glyph for choice questions. */
  glyph?: string;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  /** Short category chip shown above the question. */
  category: string;
  prompt: string;
  /** One supporting sentence; keeps each step from feeling like a form field. */
  caption?: string;
  options: readonly QuizOption[];
}

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: "wake",
    kind: "choice",
    category: "Habit",
    prompt: "The alarm goes at five. Where are you?",
    caption: "Everything starts with what you do before anyone is watching.",
    options: [
      { id: "already-out", label: "Already outside", hint: "Second lap, cold air", glyph: "🌄" },
      { id: "snooze", label: "Still horizontal", hint: "Nine more minutes. Twice.", glyph: "😴" },
      { id: "reading", label: "Reading something", hint: "Notes from last night", glyph: "📖" },
      { id: "never-slept", label: "Never went to bed", hint: "The work was not finished", glyph: "🌙" },
    ],
  },
  {
    id: "conflict",
    kind: "choice",
    category: "Instinct",
    prompt: "A fight starts in front of you. What do you do?",
    options: [
      { id: "charge", label: "Walk straight in", hint: "Decide later", glyph: "💥" },
      { id: "read", label: "Watch for the opening", hint: "Three seconds, then move", glyph: "👁" },
      { id: "shield", label: "Get between them", hint: "Nobody else gets hurt", glyph: "🛡" },
      { id: "vanish", label: "Disappear", hint: "You were never there", glyph: "🌫" },
    ],
  },
  {
    id: "power",
    kind: "choice",
    category: "Instinct",
    prompt: "If your strength had a shape, what would it be?",
    options: [
      { id: "fire", label: "A fire that won't go out", glyph: "🔥" },
      { id: "machine", label: "A machine you built", glyph: "⚙" },
      { id: "storm", label: "A strike you can't track", glyph: "⚡" },
      { id: "dark", label: "Something that eats light", glyph: "🌑" },
    ],
  },
  {
    id: "weapon",
    kind: "choice",
    category: "Habit",
    prompt: "What do you reach for?",
    options: [
      { id: "blade", label: "A blade", hint: "Close, quiet, decisive", glyph: "⚔" },
      { id: "fists", label: "Your own hands", hint: "Nothing between you and it", glyph: "👊" },
      { id: "spell", label: "Something older than you", hint: "Words, seals, a contract", glyph: "📜" },
      { id: "tech", label: "The right tool", hint: "You brought equipment", glyph: "🔧" },
    ],
  },
  {
    id: "drive",
    kind: "choice",
    category: "Instinct",
    prompt: "What actually keeps you going?",
    caption: "Be honest. This one decides more than the others.",
    options: [
      { id: "promise", label: "A promise you made", glyph: "🤝" },
      { id: "proof", label: "Proving them wrong", glyph: "🏆" },
      { id: "protect", label: "Someone behind you", glyph: "🏮" },
      { id: "summit", label: "Seeing how far it goes", glyph: "🗻" },
    ],
  },
  {
    id: "ground",
    kind: "choice",
    category: "Habit",
    prompt: "Where do you spend your time?",
    options: [
      { id: "field", label: "A court or a field", hint: "Somewhere with a scoreboard", glyph: "🏟" },
      { id: "dojo", label: "A hall with rules", hint: "Forms, repetition, discipline", glyph: "🏯" },
      { id: "street", label: "Out in the city", hint: "No schedule, no referee", glyph: "🌃" },
      { id: "library", label: "At a desk", hint: "The theory before the swing", glyph: "📚" },
    ],
  },
  {
    id: "company",
    kind: "choice",
    category: "Instinct",
    prompt: "Who is standing next to you?",
    options: [
      { id: "crew", label: "A whole crew", hint: "Loud, messy, yours", glyph: "👥" },
      { id: "one", label: "Exactly one person", glyph: "🫱" },
      { id: "rival", label: "Your rival", hint: "Not a friend. Not not a friend.", glyph: "🥀" },
      { id: "alone", label: "Nobody", hint: "That is the arrangement", glyph: "🕳" },
    ],
  },
  {
    id: "flaw",
    kind: "choice",
    category: "Instinct",
    prompt: "What gets you into trouble?",
    options: [
      { id: "temper", label: "Your temper", glyph: "🌋" },
      { id: "overthinking", label: "Thinking too much", glyph: "🌀" },
      { id: "softness", label: "You care too much", glyph: "💧" },
      { id: "secrets", label: "What you don't say", glyph: "🔒" },
    ],
  },
  {
    id: "world",
    kind: "choice",
    category: "Taste",
    prompt: "Which world would you walk into?",
    options: [
      { id: "magic", label: "One with magic in it", glyph: "✨" },
      { id: "future", label: "One built from metal", glyph: "🛰" },
      { id: "ordinary", label: "This one, honestly", glyph: "🏙" },
      { id: "haunted", label: "One with something under it", glyph: "👻" },
    ],
  },
  {
    id: "stakes",
    kind: "choice",
    category: "Taste",
    prompt: "What should a story risk?",
    options: [
      { id: "everything", label: "Everything", hint: "People do not come back", glyph: "⚰" },
      { id: "heart", label: "Someone's heart", glyph: "💔" },
      { id: "pride", label: "Pride and a title", glyph: "🥇" },
      { id: "nothing", label: "Nothing much", hint: "Let it be warm", glyph: "☕" },
    ],
  },
  {
    id: "quiet",
    kind: "choice",
    category: "Habit",
    prompt: "A rare quiet hour. What happens?",
    options: [
      { id: "music", label: "You play something", glyph: "🎼" },
      { id: "food", label: "You cook and eat too much", glyph: "🍜" },
      { id: "train", label: "You train anyway", glyph: "🥊" },
      { id: "think", label: "You go somewhere in your head", glyph: "🌌" },
    ],
  },
  {
    id: "victory",
    kind: "choice",
    category: "Instinct",
    prompt: "You win. What's on your face?",
    options: [
      { id: "grin", label: "A huge grin", glyph: "😁" },
      { id: "smirk", label: "A small smirk", glyph: "😏" },
      { id: "nothing", label: "Nothing", hint: "It was never in doubt", glyph: "😐" },
      { id: "tears", label: "You're shaking", glyph: "😤" },
    ],
  },
  {
    id: "signature",
    kind: "colour",
    category: "Colour",
    prompt: "Pick your signature colour.",
    caption: "Matched against the actual palette of every character's artwork.",
    options: [
      { id: "crimson", label: "Crimson", swatch: "#d7263d" },
      { id: "orange", label: "Ember", swatch: "#f06a25" },
      { id: "gold", label: "Gold", swatch: "#f2c14e" },
      { id: "green", label: "Verdant", swatch: "#3fa34d" },
      { id: "teal", label: "Teal", swatch: "#1ea0a6" },
      { id: "blue", label: "Deep Blue", swatch: "#2d5fd8" },
      { id: "violet", label: "Violet", swatch: "#7b4ddb" },
      { id: "pink", label: "Blossom", swatch: "#f06ba8" },
      { id: "white", label: "Snow", swatch: "#eceaf2" },
      { id: "black", label: "Ink", swatch: "#1b1a22" },
      { id: "brown", label: "Earth", swatch: "#8a5a3b" },
      { id: "silver", label: "Steel", swatch: "#9aa3b2" },
    ],
  },
  {
    id: "accent",
    kind: "colour",
    category: "Colour",
    prompt: "And the colour beside it.",
    options: [
      { id: "crimson", label: "Crimson", swatch: "#d7263d" },
      { id: "orange", label: "Ember", swatch: "#f06a25" },
      { id: "gold", label: "Gold", swatch: "#f2c14e" },
      { id: "green", label: "Verdant", swatch: "#3fa34d" },
      { id: "teal", label: "Teal", swatch: "#1ea0a6" },
      { id: "blue", label: "Deep Blue", swatch: "#2d5fd8" },
      { id: "violet", label: "Violet", swatch: "#7b4ddb" },
      { id: "pink", label: "Blossom", swatch: "#f06ba8" },
      { id: "white", label: "Snow", swatch: "#eceaf2" },
      { id: "black", label: "Ink", swatch: "#1b1a22" },
      { id: "brown", label: "Earth", swatch: "#8a5a3b" },
      { id: "silver", label: "Steel", swatch: "#9aa3b2" },
    ],
  },
  {
    id: "tone",
    kind: "choice",
    category: "Colour",
    prompt: "Light or shadow?",
    options: [
      { id: "bright", label: "Bright", hint: "Daylight, open sky", glyph: "☀" },
      { id: "balanced", label: "Somewhere between", glyph: "🌗" },
      { id: "dark", label: "Dark", hint: "Night, rain, neon", glyph: "🌑" },
    ],
  },
  {
    id: "pace",
    kind: "choice",
    category: "Taste",
    prompt: "How should it move?",
    options: [
      { id: "relentless", label: "Relentless", hint: "Never stops escalating", glyph: "🚄" },
      { id: "funny", label: "Funny", hint: "Even when it shouldn't be", glyph: "🎭" },
      { id: "slow", label: "Slow and warm", glyph: "🍵" },
      { id: "tense", label: "Tense", hint: "Something is wrong", glyph: "🩸" },
    ],
  },
] as const;

export const QUIZ_LENGTH = QUIZ.length;

export type QuizAnswers = Record<string, string>;

/** Every question answered with a valid option id. */
export function isComplete(answers: QuizAnswers): boolean {
  return QUIZ.every((question) =>
    question.options.some((option) => option.id === answers[question.id]),
  );
}
