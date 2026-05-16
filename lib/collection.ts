"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { characterById, type DeckCharacter } from "./deck";

/**
 * The visitor's saved characters, in localStorage.
 *
 * Only AniList ids are stored — the deck is already in the bundle, so there is
 * nothing to copy. That also means a saved card picks up any correction from a
 * later `npm run deck` rather than preserving stale metadata.
 */

const STORAGE_KEY = "animaforge.saved.v2";
const EVENT = "animaforge:saved";

interface StoredEntry {
  id: number;
  savedAt: number;
}

function parse(raw: string | null): StoredEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is StoredEntry =>
        typeof entry === "object" && entry !== null && typeof (entry as StoredEntry).id === "number",
    );
  } catch {
    return [];
  }
}

function read(): StoredEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function write(entries: StoredEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota or private mode — the UI degrades to "not saved" rather than crashing.
  }
  // Same-tab listeners: the native `storage` event only fires in *other* tabs.
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * `useSyncExternalStore` wiring.
 *
 * The snapshot is the raw JSON string, not a parsed array: the hook compares
 * snapshots by identity, so returning a fresh array every call would loop
 * forever. The server snapshot is `null`, which doubles as the "not hydrated
 * yet" signal the UI uses to avoid flashing the empty state.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export interface SavedCharacter {
  character: DeckCharacter;
  savedAt: number;
}

export function useCollection() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = raw !== null;

  const items = useMemo<SavedCharacter[]>(() => {
    if (raw === null) return [];
    const out: SavedCharacter[] = [];
    for (const entry of parse(raw)) {
      const character = characterById(entry.id);
      if (character) out.push({ character, savedAt: entry.savedAt ?? 0 });
    }
    return out;
  }, [raw]);

  const save = useCallback((id: number) => {
    const entries = read().filter((entry) => entry.id !== id);
    entries.unshift({ id, savedAt: Date.now() });
    write(entries.slice(0, 300));
  }, []);

  const remove = useCallback((id: number) => {
    write(read().filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  const has = useCallback((id: number) => items.some((item) => item.character.id === id), [items]);

  return { items, ready, save, remove, clear, has };
}
