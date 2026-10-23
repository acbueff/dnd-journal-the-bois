# dnd-journal-the-bois

The Backstreet Bois' journal of the Black Loch: a scrolling, player-facing record of the campaign.

**Live site:** https://acbueff.github.io/dnd-journal-the-bois/

## Update the journal

All content lives in **`journal.js`**. Edit it, then publish:

```bash
git add -A && git commit -m "Journal: <what changed>" && git push
```

GitHub Pages updates the live site within a minute or two.

- **Add an entry:** copy an existing block inside an act's `entries` list. Entry types:
  - `note`: a parchment summary
  - `scene`: a painting with a caption
  - `letter`: a recovered letter with a wax seal
  - `sending`: magical messages
  - `here`: the "We Are Here" marker
- **Add a painting:** put an image (about 1800 px wide, JPG) in `assets/scenes/` and set `img: "assets/scenes/<file>.jpg"` on a `scene` entry.
- **Chart:** each entry's `place` key must exist in `places` (rough `x`/`y` positions on a 1000×700 canvas).
- **Ledger:** the "What We Know" cards at the bottom are the `ledger` list.

**Keep it player-facing.** This repository is public, so write only what the party actually saw, heard, read or was told.

## Preview locally

```bash
./serve.sh   # http://localhost:8080
```
