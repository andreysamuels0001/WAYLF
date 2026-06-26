import type { Metadata } from "next";
import { CollectionGrid } from "@/components/collection/CollectionGrid";

export const metadata: Metadata = {
  title: "Collection",
  description: "The characters you have saved, stored locally in your browser.",
};

export default function CollectionPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          My Collection
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Saved to this browser only — no account, no upload. Export the JSON to carry
          your roster somewhere else.
        </p>
      </header>

      <CollectionGrid />
    </div>
  );
}
