# dnd-journal-the-bois

The Backstreet Bois' journal of the Black Loch: a scrolling, player-facing record of the campaign.

**Live site:** https://acbueff.github.io/dnd-journal-the-bois/

## Update the journal

All journal content lives in **`journal.js`**; the character profiles on the Company page live in **`company.js`** (portraits in `assets/people/`). Edit them, then publish:

```bash
./publish.sh "What changed"
```

The script also bumps a version stamp on the CSS and JS files, so players' browsers fetch the new content instead of a cached copy.

GitHub Pages updates the live site within a minute or two.

- **Add an entry:** copy an existing block inside an act's `entries` list. Entry types:
  - `note`: a parchment summary
  - `scene`: a painting with a caption
  - `letter`: a recovered letter with a wax seal
  - `sending`: magical messages
  - `here`: the "We Are Here" marker
- **Add a painting:** put an image (about 1800 px wide, JPG) in `assets/scenes/` and set `img: "assets/scenes/<file>.jpg"` on a `scene` entry.
- **Chart:** the map is `assets/map/black-loch.jpg` (Milby's Maps base, 2800 × 2196). Coordinates in `journal.js` use a 1400 × 1098 space (half the image's pixels).
  - `places`: every stop, with its `x`/`y`.
  - `route`: the red line, one leg per stop in travel order. Each leg's `to` is the stop it ends at, and `via` lists the bends on the way.
  - Every entry's `place` must be one of the `places`, and the first entry that reaches a place should come in route order.
  - `map.labels`: text drawn over the base map (corrections and notes).
- **Dossier:** "The Web Around Suvresk" cards are the `dossier.cards` list; `ties` link cards to each other by `id`.
- **Ledger:** the "What We Know" cards at the bottom are the `ledger` list.

**Keep it player-facing.** This repository is public, so write only what the party actually saw, heard, read or was told.

## Preview locally

```bash
./serve.sh   # http://localhost:8080
```
