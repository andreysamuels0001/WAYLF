"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { hexToHsl, hslToHex, withAlpha } from "@/lib/color";
import type { DeckCharacter } from "@/lib/deck";
import { RARITY_BY_ID } from "@/lib/rarity";
import type { RarityId } from "@/lib/types";

/**
 * The premium card.
 *
 * Full-bleed artwork with the type laid over it, rather than a picture inset in
 * a panel. The source images are AniList's standard 230x345 portrait crops, so
 * the card is built *for* a portrait — 2:3 to match the crop exactly, face in
 * the upper two thirds, information in the scrim below. Treating a headshot as
 * if it were a full figure is what made the earlier layout look like something
 * had been cut off.
 *
 * Artwork is hot-linked from AniList's CDN — never copied into the bundle — and
 * the character's own extracted palette drives the frame and glow, so every card
 * is lit in its subject's colours rather than one house accent.
 */
export interface DeckCardProps {
  character: DeckCharacter;
  rarity: RarityId;
  rank: number;
  affinity?: number;
  /** `full` adds the genre row; `compact` is the grid tile. */
  variant?: "full" | "compact";
  className?: string;
  staticCard?: boolean;
  animate?: boolean;
}

export function DeckCard({
  character,
  rarity,
  rank,
  affinity,
  variant = "full",
  className,
  staticCard = false,
  animate = false,
}: DeckCardProps) {
  const tier = RARITY_BY_ID[rarity];
  const ref = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<{ rx: number; ry: number; fx: number } | null>(null);

  const [tone, accent = tone, deep = tone] = character.palette;
  const [frameOuter, frameMid, frameInner] = tier.frame;

  /*
   * A palette pulled from real artwork can be any lightness, and a dark or
   * desaturated accent vanishes when used as type on the scrim. Clamping it into
   * a legible band keeps the card tinted by the character without ever producing
   * unreadable text — Levi's browns and Killua's near-white both needed this.
   */
  const accentHsl = hexToHsl(accent);
  const textAccent = hslToHex({
    h: accentHsl.h,
    s: Math.max(38, Math.min(82, accentHsl.s)),
    l: Math.max(64, Math.min(82, accentHsl.l)),
  });

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (staticCard) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setPointer({ rx: (0.5 - y) * 8, ry: (x - 0.5) * 10, fx: x * 100 });
    },
    [staticCard],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPointer(null)}
      className={cn(
        "group relative [transform-style:preserve-3d]",
        animate && "animate-reveal-card",
        className,
      )}
      style={{
        transform: pointer
          ? `perspective(1300px) rotateX(${pointer.rx}deg) rotateY(${pointer.ry}deg) scale(1.02)`
          : "perspective(1300px)",
        transition: pointer ? "transform 80ms linear" : "transform 500ms var(--ease-out-soft)",
      }}
    >
      {/* Bloom behind the card, in the character's own colours */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-55 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(62% 52% at 50% 38%, ${withAlpha(accent, 0.5 + tier.shine * 0.3)}, ${withAlpha(tier.glow, 0.26)} 58%, transparent 80%)`,
        }}
      />

      {/* Metal frame */}
      <div
        className="relative overflow-hidden rounded-[1.4rem] p-[2.5px] shadow-deep"
        style={{
          background: `linear-gradient(145deg, ${frameMid} 0%, ${frameOuter} 32%, ${accent} 50%, ${frameInner} 70%, ${frameMid} 100%)`,
        }}
      >
        <div className="relative overflow-hidden rounded-[1.25rem] bg-abyss">
          {/* Artwork fills the card; 2:3 matches AniList's crop with no further loss */}
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${tone}, ${deep})` }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.image}
              alt={`${character.name} from ${character.series}`}
              className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />

            {/* Scrim: dark enough at the base to carry type, clear over the face */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(to top, #07070f 2%, ${withAlpha("#07070f", 0.92)} 20%, ${withAlpha("#07070f", 0.35)} 44%, transparent 62%)`,
              }}
            />
            {/* Colour wash from the palette, so art and frame agree */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
              style={{ background: `linear-gradient(200deg, ${accent}, transparent 55%)` }}
            />
            {/* Edge vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `inset 0 0 60px 10px ${withAlpha("#05040c", 0.55)}` }}
            />

            {/* Top row */}
            <div className="absolute inset-x-0 top-0 flex items-start gap-2 p-3">
              <span
                className="shrink-0 rounded-md px-2 py-1 font-mono text-[0.62rem] font-bold backdrop-blur-sm"
                style={{
                  background: withAlpha("#05040c", 0.72),
                  color: "#ffffff",
                  boxShadow: `inset 0 0 0 1px ${withAlpha(textAccent, 0.55)}`,
                }}
              >
                #{rank + 1}
              </span>
              <span
                className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] backdrop-blur-sm"
                style={{
                  background: withAlpha(tier.glow, 0.22),
                  color: "#fff",
                  boxShadow: `inset 0 0 0 1px ${withAlpha(tier.glow, 0.7)}`,
                  textShadow: `0 1px 6px ${withAlpha("#000", 0.7)}`,
                }}
              >
                {tier.label}
              </span>
            </div>

            {/* Name plate, over the art */}
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <p
                className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: textAccent }}
              >
                {character.series}
              </p>
              <h3 className="mt-1 truncate font-display text-[1.15rem] font-extrabold leading-tight tracking-tight text-white">
                {character.name}
              </h3>
              {character.native ? (
                <p className="truncate text-[0.72rem] text-white/55">{character.native}</p>
              ) : null}

              {variant === "full" ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {character.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded px-1.5 py-0.5 text-[0.58rem] font-medium text-white/85"
                      style={{ background: withAlpha(textAccent, 0.26) }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="flex items-baseline gap-1">
                  <span
                    className="font-mono text-[0.82rem] font-bold tabular-nums"
                    style={{ color: tier.glow }}
                  >
                    {character.favourites.toLocaleString("en-US")}
                  </span>
                  <span className="text-[0.62rem] text-white/45">♥</span>
                </span>
                {affinity !== undefined ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold"
                    style={{
                      background: withAlpha(textAccent, 0.28),
                      color: "#fff",
                      boxShadow: `inset 0 0 0 1px ${withAlpha(textAccent, 0.7)}`,
                    }}
                  >
                    {affinity}% match
                  </span>
                ) : (
                  <span className="font-mono text-[0.6rem] text-white/40">
                    {character.year ?? ""}
                  </span>
                )}
              </div>

              {/* The extracted palette, as a hairline. Shows the card is built
                  from the character's real colours. */}
              <div className="mt-2.5 flex h-[3px] overflow-hidden rounded-full">
                {character.palette.map((swatch, index) => (
                  <span key={index} className="flex-1" style={{ background: swatch }} />
                ))}
              </div>
            </div>
          </div>

          {/* Foil sweep */}
          <div
            aria-hidden
            className="foil pointer-events-none absolute inset-0 rounded-[1.25rem]"
            style={
              {
                "--foil": pointer ? 0.14 + tier.shine * 0.6 : 0,
                "--foil-pos": pointer ? `${120 - pointer.fx * 1.6}%` : "150%",
              } as React.CSSProperties
            }
          />
          {/* Inner hairline — reads as leaf rather than one hard stroke */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[3px] rounded-[1.1rem]"
            style={{ boxShadow: `inset 0 0 0 1px ${withAlpha(tier.glow, 0.28)}` }}
          />
        </div>
      </div>
    </div>
  );
}
