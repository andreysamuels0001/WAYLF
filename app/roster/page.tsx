import type { Metadata } from "next";
import { RosterBrowser } from "@/components/roster/RosterBrowser";
import { DECK, DECK_SOURCE, allSeries } from "@/lib/deck";

export const metadata: Metadata = {
  title: "The Deck",
  description:
    "All 500 characters, ranked by how loved they are. Filter by genre and tier.",
};

export default async function RosterPage({ searchParams }: PageProps<"/roster">) {
  const params = await searchParams;
  const genre = typeof params.genre === "string" ? params.genre : undefined;
  const series = allSeries();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          The Deck
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          The {DECK.length} most-loved characters in anime, across {series.length} series.
          Rank is popularity — the top ten are Mythic.
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Characters" value={DECK.length.toString()} />
          <Stat label="Series" value={series.length.toString()} />
          <Stat label="Top series" value={series[0]?.series ?? "—"} />
        </dl>
        <p className="mt-4 text-[0.7rem] text-ink-faint">
          Character data and artwork via {DECK_SOURCE}. All artwork remains the property of
          its respective rights holders.
        </p>
      </header>

      <RosterBrowser initialGenre={genre} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className="font-display text-lg font-bold text-ink">{value}</dd>
    </div>
  );
}
