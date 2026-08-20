# Anime Character Quiz

A sixteen question quiz that matches you against the 500 most-loved characters
in anime.

## Running it

```bash
npm install
npm run deck    # pull the character data from AniList
npm run dev
```

No API key needed. The deck is built ahead of time from AniList's public API.

## Notes

- Questions live in `lib/quiz/questions.ts` and ship to the client.
- Scoring lives in `lib/quiz/match.ts` and is server-only, so the outcome
  table never reaches the browser.
- Results are sealed with AES-256-GCM before they go in a share link.

Character data and artwork via AniList. Artwork belongs to its rights holders.
