import Link from "next/link";
import { Layers, Link2, Lock, Palette, Sparkles, Wand2, Zap } from "lucide-react";
import { DeckCard } from "@/components/deck/DeckCard";
import { withAlpha } from "@/lib/color";
import { DECK, DECK_SOURCE, allGenres, allSeries, rarityForRank } from "@/lib/deck";
import { QUIZ } from "@/lib/quiz/questions";

const FEATURES = [
  {
    icon: Palette,
    title: "Matched on real colour",
    body: "Every character's palette is read from their actual artwork, so the colour questions match what they really look like — not a label someone typed.",
  },
  {
    icon: Layers,
    title: "Rarity that means something",
    body: "Tiers come from real popularity. The ten most-loved characters in the deck are Mythic; nobody gets promoted by a code change.",
  },
  {
    icon: Lock,
    title: "Sealed results",
    body: "Your result is encrypted with AES-256-GCM before it leaves the server. Edit the link and it stops opening — no forging a Mythic.",
  },
  {
    icon: Link2,
    title: "Shareable",
    body: "Every result compresses into a link. Send it and the other side sees exactly the card you got.",
  },
  {
    icon: Zap,
    title: "Instant and free",
    body: "The deck is already built. No account, no API key, no credits, no render queue — answers in, card out.",
  },
  {
    icon: Sparkles,
    title: "A reveal, not a page load",
    body: "A charge, a burst of light in the character's own colours, then the card. Higher tiers burn brighter.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Answer honestly",
    body: "Sixteen questions about habits, instincts and colour. How you wake up, what you do when a fight starts, what you reach for.",
  },
  {
    step: "02",
    title: "All 500 are scored",
    body: "Your answers become genre, theme and palette weights, and every character in the deck is ranked against them on the server.",
  },
  {
    step: "03",
    title: "Your card is revealed",
    body: "The closest match arrives as a premium collectible card with its rarity, its series, and why it chose you.",
  },
];

export default function Home() {
  const hero = [0, 1, 2].map((rank) => ({
    character: DECK[rank],
    rank,
    rarity: rarityForRank(rank),
  }));
  const series = allSeries();
  const genres = allGenres();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              <Sparkles className="size-3.5 text-flare" />
              {QUIZ.length} questions · {DECK.length} characters
            </p>

            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.03] tracking-tight text-balance text-ink sm:text-6xl">
              Answer 16 questions.
              <span className="block bg-gradient-to-r from-flare via-rose to-violet bg-clip-text text-transparent">
                Find your character.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-ink-muted">
              Your habits, your instincts, your colours — matched against the {DECK.length}{" "}
              most-loved characters in anime, across {series.length} series. Then your card
              is revealed. No account, nothing uploaded, result sealed and shareable.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/studio?start=1"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-6 py-3.5 text-sm font-bold text-void shadow-lift transition-transform duration-200 hover:scale-[1.03] active:scale-[0.99]"
              >
                <Wand2 className="size-4" />
                Start the questions
              </Link>
              <Link
                href="/roster"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink-muted transition-colors hover:border-line-bright hover:text-ink"
              >
                Browse the deck
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              <HeroStat label="Characters" value={DECK.length.toString()} />
              <HeroStat label="Series" value={series.length.toString()} />
              <HeroStat label="Genres" value={genres.length.toString()} />
            </dl>
          </div>

          {/* Fanned cards — the three most-loved characters in the deck */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="relative h-[420px] sm:h-[500px]">
              {hero.map(({ character, rank, rarity }, index) => {
                const layout = [
                  { place: "hidden sm:block left-[24%]", y: 34, r: -12, z: 10 },
                  { place: "left-1/2", y: 0, r: 0, z: 30 },
                  { place: "hidden sm:block left-[76%]", y: 34, r: 12, z: 20 },
                ][index];
                return (
                  <div
                    key={character.id}
                    className={`absolute top-0 w-[248px] sm:w-[268px] ${layout.place}`}
                    style={{
                      transform: `translateX(-50%) translateY(${layout.y}px) rotate(${layout.r}deg)`,
                      zIndex: layout.z,
                    }}
                  >
                    <DeckCard
                      character={character}
                      rarity={rarity}
                      rank={rank}
                      variant="compact"
                      staticCard={index !== 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-abyss/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Sixteen questions, one card
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-bright"
              >
                <span className="font-mono text-xs font-bold text-flare">{step.step}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Every corner of anime
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Shonen brawlers, sports aces, detectives, mecha pilots, slice-of-life leads.
              Your answers decide which corner you land in.
            </p>
          </div>
          <Link
            href="/roster"
            className="text-sm font-semibold text-flare transition-colors hover:text-flare-soft"
          >
            See all {DECK.length} →
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/roster?genre=${encodeURIComponent(genre)}`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-muted transition-all hover:-translate-y-0.5 hover:border-violet/50 hover:text-ink"
            >
              {genre}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[3, 4, 5, 6].map((rank) => (
            <DeckCard
              key={DECK[rank].id}
              character={DECK[rank]}
              rarity={rarityForRank(rank)}
              rank={rank}
              variant="compact"
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-abyss/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Built to actually be used
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-line bg-surface p-6">
                <feature.icon className="size-5 text-flare" />
                <h3 className="mt-4 font-display text-base font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(40rem 20rem at 50% 0%, ${withAlpha("#ff5a3c", 0.18)}, transparent 70%)`,
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance text-ink sm:text-4xl">
Which one are you?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              {DECK.length} characters. Sixteen questions. About ninety seconds.
            </p>
            <Link
              href="/studio?start=1"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-7 py-3.5 text-sm font-bold text-void shadow-lift transition-transform duration-200 hover:scale-[1.03]"
            >
              <Wand2 className="size-4" />
              Answer the questions
            </Link>
            <p className="mt-6 text-[0.7rem] text-ink-faint">
              Character data and artwork via {DECK_SOURCE}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink">{value}</dd>
    </div>
  );
}
