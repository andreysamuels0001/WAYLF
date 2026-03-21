"use client";

import { useEffect, useMemo, useState } from "react";
import { DeckCard } from "@/components/deck/DeckCard";
import { cn } from "@/lib/cn";
import { withAlpha } from "@/lib/color";
import type { DeckCharacter } from "@/lib/deck";
import { RARITY_BY_ID } from "@/lib/rarity";
import { Rng } from "@/lib/rng";
import type { RarityId } from "@/lib/types";

/**
 * The reveal.
 *
 * Staged rather than instant: a charge, a burst of light, then the card. The
 * pause is the point — a card that simply appears reads as a page load, while a
 * beat of anticipation makes the result feel earned, and higher rarities get a
 * longer, brighter burst so the tier is legible before the label is read.
 *
 * The burst is tinted with the character's own extracted palette, so the light
 * that announces them is literally their colour.
 */
const STAGE_MS = { charge: 900, burst: 430 };

export interface CardRevealProps {
  character: DeckCharacter;
  rarity: RarityId;
  rank: number;
  affinity: number;
  className?: string;
}

export function CardReveal({ character, rarity, rank, affinity, className }: CardRevealProps) {
  const tier = RARITY_BY_ID[rarity];
  const accent = character.palette[1] ?? character.palette[0] ?? tier.glow;

  const [stage, setStage] = useState<"charge" | "burst" | "card">("charge");
  const [playedFor, setPlayedFor] = useState(character.id);

  // Rewinding to "charge" for a new character happens during render, not in the
  // effect — the effect only schedules the timers, which is its actual job.
  if (playedFor !== character.id) {
    setPlayedFor(character.id);
    setStage("charge");
  }

  useEffect(() => {
    const toBurst = setTimeout(() => setStage("burst"), STAGE_MS.charge);
    const toCard = setTimeout(() => setStage("card"), STAGE_MS.charge + STAGE_MS.burst);
    return () => {
      clearTimeout(toBurst);
      clearTimeout(toCard);
    };
  }, [character.id]);

  // Spark vectors are seeded off the character so the burst is stable across
  // re-renders and identical for a shared result.
  const sparks = useMemo(() => {
    const rng = new Rng(`${character.id}-sparks`);
    const count = 22 + Math.round(tier.shine * 26);
    return Array.from({ length: count }, () => {
      const angle = rng.range(0, Math.PI * 2);
      const distance = rng.range(120, 360);
      return {
        dx: `${(Math.cos(angle) * distance).toFixed(0)}px`,
        dy: `${(Math.sin(angle) * distance).toFixed(0)}px`,
        size: rng.range(3, 10),
        delay: rng.range(0, 280),
        bright: rng.chance(0.42),
      };
    });
  }, [character.id, tier.shine]);

  const showCard = stage === "card";
  const showBurst = stage !== "charge";

  return (
    <div className={cn("relative mx-auto w-full max-w-[380px]", className)}>
      <div
        aria-hidden
        className="animate-reveal-halo pointer-events-none absolute left-1/2 top-1/2 size-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: withAlpha(accent, 0.22 + tier.shine * 0.3) }}
      />

      {!showCard ? (
        <div
          className="relative grid aspect-[13/20] w-full place-items-center rounded-[1.4rem] border"
          style={{
            borderColor: withAlpha(tier.glow, 0.5),
            background: `radial-gradient(circle at 50% 45%, ${withAlpha(tier.glow, 0.28)}, rgb(10 10 22 / 0.95) 70%)`,
          }}
        >
          <div className="size-20 animate-pulse rounded-full blur-xl" style={{ background: withAlpha(tier.glow, 0.9) }} />
          <p
            className="absolute bottom-10 text-[0.68rem] font-semibold uppercase tracking-[0.3em]"
            style={{ color: withAlpha(tier.glow, 0.85) }}
          >
            Searching the deck
          </p>
        </div>
      ) : null}

      {showBurst ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-visible">
          <div
            className="animate-reveal-burst absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: withAlpha(accent, 0.95) }}
          />
          <div
            className="animate-reveal-ring absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: withAlpha(tier.glow, 0.9) }}
          />
          {sparks.map((spark, index) => (
            <span
              key={index}
              className="animate-reveal-spark absolute left-1/2 top-1/2 rounded-full"
              style={
                {
                  "--dx": spark.dx,
                  "--dy": spark.dy,
                  width: spark.size,
                  height: spark.size,
                  background: spark.bright ? "#ffffff" : accent,
                  boxShadow: `0 0 14px ${withAlpha(accent, 0.9)}`,
                  animationDelay: `${spark.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      {showCard ? (
        <div className="animate-reveal-card relative z-10">
          <DeckCard character={character} rarity={rarity} rank={rank} affinity={affinity} />
          <div
            aria-hidden
            className="animate-reveal-sweep pointer-events-none absolute inset-0 rounded-[1.4rem]"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 0.55) 48%, transparent 62%)",
              backgroundSize: "240% 100%",
              mixBlendMode: "overlay",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
