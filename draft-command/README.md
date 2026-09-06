# Draft Command

A single-page, offline-capable PWA for running a live fantasy football draft: pick recommendations, roster tracking, a full snake-draft tracker, and a drag-to-reorder pre-draft board.

## Structure

- `index.html` — the entire app (markup, styles, and vanilla JS logic), no build step
- `manifest.json` — PWA manifest (installable on iOS/Android/desktop)
- `sw.js` — service worker; caches the app shell for offline use during a draft
- `icons/` — app icons (placeholder solid-color PNGs — swap these for real artwork)

## Running locally

```
cd draft-command
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Deploying

Any static host works. For Netlify: set the publish directory to `draft-command/`, or drag-and-drop the folder at app.netlify.com/drop.

## Configuring for your league

Edit the `LEAGUE` object and `RAW_BOARD` array near the top of the `<script>` block in `index.html` — league size, roster requirements, seconds per pick, and the initial player rankings/tiers are all there. The board can also be edited live from the "Board" tab, or replaced wholesale via the JSON import/export panel.

All draft state (setup, picks, board order) is saved to `localStorage`, so a page reload mid-draft doesn't lose progress.
