"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { DeckCard } from "@/components/deck/DeckCard";
import { cn } from "@/lib/cn";
import { DECK, allGenres, rarityForRank } from "@/lib/deck";
import { RARITY_TIERS } from "@/lib/rarity";
import type { RarityId } from "@/lib/types";

const PAGE_SIZE = 24;

type SortKey = "rank" | "name-asc" | "year-desc" | "series";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "rank", label: "Most loved" },
  { id: "name-asc", label: "Name A–Z" },
  { id: "year-desc", label: "Newest" },
  { id: "series", label: "Series" },
];

export function RosterBrowser({ initialGenre }: { initialGenre?: string }) {
  // The deck is a static import, so this costs no network and renders on the
  // server identically to the client.
  const genreList = useMemo(() => allGenres(), []);
  const ranked = useMemo(
    () => DECK.map((character, rank) => ({ character, rank, rarity: rarityForRank(rank) })),
    [],
  );

  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<Set<string>>(
    () => new Set(initialGenre && genreList.includes(initialGenre) ? [initialGenre] : []),
  );
  const [rarities, setRarities] = useState<Set<RarityId>>(new Set());
  const [sort, setSort] = useState<SortKey>("rank");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = ranked.filter(({ character, rarity }) => {
      if (genres.size && !character.genres.some((genre) => genres.has(genre))) return false;
      if (rarities.size && !rarities.has(rarity)) return false;
      if (!needle) return true;
      return (
        character.name.toLowerCase().includes(needle) ||
        (character.native ?? "").includes(needle) ||
        character.series.toLowerCase().includes(needle) ||
        character.genres.some((genre) => genre.toLowerCase().includes(needle))
      );
    });

    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.character.name.localeCompare(b.character.name);
        case "year-desc":
          return (b.character.year ?? 0) - (a.character.year ?? 0) || a.rank - b.rank;
        case "series":
          return a.character.series.localeCompare(b.character.series) || a.rank - b.rank;
        case "rank":
        default:
          return a.rank - b.rank;
      }
    });
    return sorted;
  }, [ranked, query, genres, rarities, sort]);

  const hasFilters = genres.size > 0 || rarities.size > 0 || query !== "";

  /** Every filter change rewinds pagination, in the handler rather than an effect. */
  function changeFilter(mutate: () => void) {
    mutate();
    setVisible(PAGE_SIZE);
  }

  function toggle<T>(set: Set<T>, value: T, apply: (next: Set<T>) => void) {
    changeFilter(() => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      apply(next);
    });
  }

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-line bg-void/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => changeFilter(() => setQuery(event.target.value))}
              placeholder="Search name or series…"
              className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-violet"
              aria-label="Search the deck"
            />
          </div>

          <label className="sr-only" htmlFor="deck-sort">
            Sort order
          </label>
          <select
            id="deck-sort"
            value={sort}
            onChange={(event) => changeFilter(() => setSort(event.target.value as SortKey))}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-muted outline-none transition-colors focus:border-violet"
          >
            {SORTS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              filtersOpen || hasFilters
                ? "border-violet/50 bg-violet/10 text-violet"
                : "border-line bg-surface-2 text-ink-muted hover:text-ink",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {hasFilters ? (
              <span className="rounded-full bg-violet/25 px-1.5 text-[0.65rem] font-bold">
                {genres.size + rarities.size + (query ? 1 : 0)}
              </span>
            ) : null}
          </button>

          {hasFilters ? (
            <button
              type="button"
              onClick={() =>
                changeFilter(() => {
                  setQuery("");
                  setGenres(new Set());
                  setRarities(new Set());
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-ink-faint transition-colors hover:text-ink"
            >
              <X className="size-3.5" />
              Clear
            </button>
          ) : null}

          <p className="ml-auto shrink-0 font-mono text-xs text-ink-faint">
            {filtered.length} / {DECK.length}
          </p>
        </div>

        {filtersOpen ? (
          <div className="mt-3 space-y-3 rounded-xl border border-line bg-surface p-3">
            <FilterRow label="Genre">
              {genreList.map((genre) => (
                <FilterChip
                  key={genre}
                  active={genres.has(genre)}
                  accent="#a78bfa"
                  onClick={() => toggle(genres, genre, setGenres)}
                >
                  {genre}
                </FilterChip>
              ))}
            </FilterRow>
            <FilterRow label="Tier">
              {RARITY_TIERS.map((tier) => (
                <FilterChip
                  key={tier.id}
                  active={rarities.has(tier.id)}
                  accent={tier.glow}
                  onClick={() => toggle(rarities, tier.id, setRarities)}
                >
                  {tier.label}
                </FilterChip>
              ))}
            </FilterRow>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-20 text-center">
          <p className="font-display text-lg font-bold text-ink">Nobody matches that</p>
          <p className="mt-1.5 text-sm text-ink-muted">
            Try a different genre, or clear the filters to see all {DECK.length}.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, visible).map(({ character, rank, rarity }) => (
              <DeckCard
                key={character.id}
                character={character}
                rarity={rarity}
                rank={rank}
                variant="compact"
              />
            ))}
          </div>

          {visible < filtered.length ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((value) => value + PAGE_SIZE)}
                className="rounded-full border border-line bg-surface-2 px-6 py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-line-bright hover:text-ink"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
              </button>
            </div>
          ) : (
            <p className="mt-10 text-center text-xs text-ink-faint">
              That is all {filtered.length} of them.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-12 shrink-0 text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-1 text-[0.7rem] font-medium transition-colors",
        active ? "text-void" : "border-line bg-surface-2 text-ink-muted hover:text-ink",
      )}
      style={active ? { background: accent, borderColor: accent } : undefined}
    >
      {children}
    </button>
  );
}
