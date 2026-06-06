"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { DeckCard } from "@/components/deck/DeckCard";
import { useCollection } from "@/lib/collection";
import { rankOf, rarityForRank } from "@/lib/deck";

export function CollectionGrid() {
  const { items, ready, remove, clear } = useCollection();
  const [confirming, setConfirming] = useState(false);

  // Avoids a flash of the empty state before localStorage has been read.
  if (!ready) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="aspect-[13/20] animate-pulse rounded-[1.4rem] border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-20 text-center">
        <Sparkles className="mx-auto size-8 text-ink-faint" />
        <h2 className="mt-4 font-display text-xl font-bold text-ink">Nothing saved yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          Characters you save land here. Your collection lives in this browser only —
          nothing is uploaded anywhere.
        </p>
        <Link
          href="/studio?start=1"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-5 py-2.5 text-sm font-bold text-void transition-transform hover:scale-[1.03]"
        >
          <Sparkles className="size-4" />
          Find your character
        </Link>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs text-ink-faint">
          {items.length} saved {items.length === 1 ? "character" : "characters"}
        </p>
        {confirming ? (
          <span className="ml-auto inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clear();
                setConfirming(false);
              }}
              className="rounded-lg border border-flare/50 bg-flare/15 px-3 py-2 text-xs font-semibold text-flare"
            >
              Delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg px-2 py-2 text-xs text-ink-faint hover:text-ink"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-flare/50 hover:text-flare"
          >
            <Trash2 className="size-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((item) => {
          const rank = rankOf(item.character.id);
          return (
            <div key={item.character.id} className="group/item relative">
              <DeckCard
                character={item.character}
                rarity={rarityForRank(rank)}
                rank={rank}
                variant="compact"
              />
              <button
                type="button"
                onClick={() => remove(item.character.id)}
                title={`Remove ${item.character.name}`}
                className="absolute right-3 top-3 z-30 inline-flex size-8 items-center justify-center rounded-lg border border-line bg-void/80 text-ink-faint opacity-0 backdrop-blur transition-all hover:border-flare/50 hover:text-flare focus-visible:opacity-100 group-hover/item:opacity-100"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Remove {item.character.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
