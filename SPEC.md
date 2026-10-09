# Monster Mash

Small personal website. Visitors rank Monster Energy flavors through head-to-head picks, tournament style.

## Requirements

- Each compare scene shows two flavors. The visitor picks the one they prefer.
- Each compare scene has a **Reroll** option. Reroll replaces the current pair with a new pair. It records no result.
- Each compare scene has an **exclude** option per flavor, labeled "I've never tried this flavor". The excluded flavor leaves the pool for the rest of the session and does not appear in the final ranking.
- A visitor ranks only flavors they have tried. The ranking lists a flavor only after it has been in at least one pick. Flavors marked "never tried" never appear in it.
- Design: Persona 5 inspired. Flashy, boxy, angular panels, strong animation.
- Static site on GitHub Pages. All state stays in the browser (`localStorage`, key `monster-mash:v1`).

## Stack

React, TypeScript, Vite, `motion` for animation, Vitest for the ranking logic.

```sh
npm install
npm run dev     # local dev server
npm test        # ranking logic tests
npm run build   # static build in dist/
```

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. In the repo settings, set Pages > Source to "GitHub Actions". The build uses a relative base path, so it works under any repo name.

## Ranking

The app stores only the list of picks and exclusions. It replays the picks as Elo matches (start 1000, K 32) to get the ranking, so undo removes the last pick. The next pair is the flavor with the fewest matches against an unmet flavor with a close rating. The ranking counts as settled when each flavor has 4 matches.

When a flavor is excluded, every pick that included it stops counting, for both flavors. A pick against a flavor the visitor never tried says nothing. If the opponent has no other picks, it leaves the ranking until it comes up again. "Put back" restores those picks.

## Data

- `src/data/flavors.json`: 52 US flavors from https://www.monsterenergy.com/en-us/energy-drinks/ (scraped 2026-10-09).
- `public/cans/<id>.webp`: can image for each flavor, 148x370 WebP (quality 85) with transparency. Converted from the source PNGs, which `sourceImage` in the JSON links to.
