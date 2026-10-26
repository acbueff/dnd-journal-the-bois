/*
  THE JOURNAL OF THE BACKSTREET BOIS — Book II
  ------------------------------------------------------------
  All journal content lives in this file. The page layout (index.html / app.js)
  reads it and builds the timeline, the chart and the ledger.

  PLAYER-FACING ONLY: write only what the bois saw, heard, read or were told.
  DM secrets stay in the vault.

  Entry types:
    note     – parchment summary                      { title, date, place, text }
    scene    – painting + caption parchment           { title, date, place, img, alt, text }
               (set img: null to show an "unfinished painting" placeholder)
    letter   – recovered letter with wax seal         { title, date, place, from, to, quotes[], text }
    sending  – magical messages received              { title, date, place, messages: [{ from, text }] }
    here     – "you are here" marker for the latest entry

  `place` must match a key in JOURNAL.places (drives the chart).
  Text fields accept simple HTML (<em>, <strong>, <br>).
*/

window.JOURNAL = {
  title: "The Backstreet Bois",
  subtitle: "A Journal of the Black Loch",
  book: "Book II — From Wave Echo Cave to Zarzula's Rest",
  year: "1491 DR",

  /* ── The chart ──────────────────────────────────────────────────────────
     Coordinates are in the map's own space: 1400 × 1098 (the image is 2800 × 2196).
     `route` is the red line, leg by leg, in the order the bois travelled. Each leg ends
     at a stop (`to`), and `via` are the bends in between, traced from the DM's working map.
     The chart reveals the route up to the leg ending at the place of the entry being read. */
  map: {
    image: "assets/map/black-loch.jpg",
    width: 1400, height: 1098,
    credit: "Base map: Milby's Maps (milbysmaps.com). Route and notes by the bois.",
    /* Labels drawn over the base map where the bois know better than the old chart */
    labels: [
      { text: "Zarzula's Rest", x: 722, y: 397, size: 14, cls: "fix" },
      { text: "House Mizzrym", x: 352, y: 158, size: 11, cls: "note" },
      { text: "Bluescale waters", x: 300, y: 622, size: 13, cls: "realm" },
      { text: "the Mist", x: 560, y: 243, size: 10, cls: "note" }
    ]
  },

  places: {
    "wave-echo":      { name: "Wave Echo Cave",              x: 496, y: 1092 },
    "river":          { name: "Run Down on the River",       x: 532, y: 1040 },
    "sandbank":       { name: "The Sand Bank (the Lonely)",  x: 571, y: 978 },
    "grinning-widow": { name: "The Grinning Widow",          x: 598, y: 838 },
    "first-rest":     { name: "First Night's Rest",          x: 738, y: 574 },
    "isle-ash":       { name: "Isle of Ash (umber hulks)",   x: 963, y: 230 },
    "charwall":       { name: "Charwall",                    x: 925, y: 186 },
    "ruby-beach":     { name: "The Ruby Beach",              x: 917, y: 262 },
    "sloop-trap":     { name: "The Booby-Trapped Sloop",     x: 928, y: 208 },
    "kaliphex-isle":  { name: "Back of Kaliphex's Isle",     x: 939, y: 299 },
    "zarzula-waters": { name: "Where the Sloop Sank",        x: 713, y: 356 },
    "delaro":         { name: "Delaro's Manse",              x: 586, y: 288 },
    "shuushar-isle":  { name: "Shuushar's Islet",            x: 680, y: 282 },
    "scarhide":       { name: "Scarhide Yard",               x: 608, y: 92 },
    "cultain-waters": { name: "The Cultain Ship",            x: 452, y: 452 },
    "troll-waters":   { name: "Where Savras Appeared",       x: 487, y: 505 },
    "glogdolp":       { name: "Glogdolp",                    x: 427, y: 630 },
    "zarzula":        { name: "Zarzula's Rest",              x: 793, y: 393 }
  },

  route: [
    { to: "river",          via: [[503, 1080], [520, 1058]] },
    { to: "sandbank",       via: [[557, 1013]] },
    { to: "grinning-widow", via: [[572, 950], [573, 910], [610, 862]] },
    { to: "first-rest",     via: [[622, 805], [643, 760], [645, 715], [634, 672], [652, 638], [690, 606]] },
    { to: "isle-ash",       via: [[800, 520], [880, 450], [950, 392], [976, 330], [978, 278]] },
    { to: "charwall",       via: [[948, 244], [930, 225]] },
    { to: "ruby-beach",     via: [[914, 214], [912, 242]] },
    { to: "sloop-trap",     via: [[926, 240]] },
    { to: "kaliphex-isle",  via: [[938, 240], [946, 272]] },
    { to: "zarzula-waters", via: [[962, 318], [948, 360], [902, 398], [845, 418], [800, 414], [762, 390]] },
    { to: "delaro",         via: [[660, 330], [610, 300]] },
    { to: "shuushar-isle",  via: [[630, 278]] },
    { to: "scarhide",       via: [[668, 215], [640, 150], [614, 104]] },
    { to: "cultain-waters", via: [[596, 160], [570, 230], [560, 290], [540, 350], [492, 410]] },
    { to: "troll-waters",   via: [[470, 482]] },
    { to: "glogdolp",       via: [[478, 560], [445, 610]] },
    { to: "zarzula",        via: [[500, 592], [600, 522], [700, 452], [760, 414]] }
  ],

  acts: [
    /* ───────────────────────────── I ───────────────────────────── */
    {
      numeral: "I",
      title: "Into the Deep",
      subtitle: "Wave Echo Cave · the Underdark River · the Grinning Widow",
      entries: [
        {
          type: "scene",
          title: "Leaving Wave Echo Cave",
          date: "~Summertide 28",
          place: "wave-echo",
          img: "assets/scenes/leaving-wave-echo-cave-v3.jpg",
          alt: "The bois sail a captured duergar sloop away from a cave dock while the Falcon and Nowhere watch from the pier.",
          text: "The Black Spider was dead, and the Lords' Alliance was closing on Wave Echo Cave. The bois took a duergar <strong>arcane sloop</strong> and steered it into the river tunnels of the Underdark. <strong>The Falcon</strong> and <strong>Nowhere</strong> had fought beside them, but they chose to stay behind and watched the boat vanish into the dark."
        },
        {
          type: "note",
          title: "What the Duergar Told Us",
          date: "~Summertide 28",
          place: "wave-echo",
          text: "The duergar crew they took the sloop from served <strong>Zarzula's Rest</strong>. Their captain was <strong>Thrunbar</strong> of the warship <em>Grinning Widow</em>, who took his orders from <strong>Ruxithid the Chosen</strong>. Ruxithid answers to a mind flayer named <strong>Suvresk</strong>.<br><br>Suvresk had already found what he came for: a great <strong>Black Shard</strong> that powered the Forge of Spells. He had taken it away."
        },
        {
          type: "note",
          title: "Run Down on the River",
          date: "~Summertide 28",
          place: "river",
          text: "The sloop's crystal charges ran low, and fast duergar jetboats from Zarzula's Rest caught the bois. Outnumbered and spent, they were <strong>captured</strong>, and every weapon, every piece of armour and every coin was taken from them. Stor and Thrak came away with wounds that will never fully heal."
        },
        {
          type: "scene",
          title: "The Lonely and the Stolen Jetboat",
          date: "~Summertide 28–29",
          place: "sandbank",
          img: "assets/scenes/escape-underdark-river-v1.jpg",
          alt: "The bois, stripped to their underclothes, flee in a green-glowing jetboat with a kobold while grey sorrowsworn slaughter duergar on a sand bank.",
          text: "The duergar camped on a <strong>sand bank</strong> where the Stone-scale kobolds once lived. Among their captives was a kobold named <strong>Shrilliam</strong>, who befriended the bois. Then <strong>the Lonely</strong>, grey and grieving horrors of the Shadowfell, rose from the water and began to feed on the duergar. In the chaos, the bois and Shrilliam stole an arcane jetboat and fled in their smallclothes. (One duergar had whispered that a wizard opened a portal to the Shadowfell beneath the Black Loch.)"
        },
        {
          type: "scene",
          title: "Battle at the Grinning Widow",
          date: "~Summertide 29",
          place: "grinning-widow",
          img: "assets/scenes/grinning-widow-v1.jpg",
          alt: "On small boats beside a burning duergar warship, Immeral faces a psychic duergar over a fallen kobold while Tim floats down casting teal spikes.",
          text: "The crystals in the stolen boats dragged them like a lodestone to the <em>Grinning Widow</em>. They arrived just as <strong>kuo-toa raiders and a giant siege crab</strong> tore into her crew. Re-armed from duergar stores, the bois fought the <strong>Realm-Touched</strong>, psychic duergar with green crystals in their skulls.<br><br><strong>Shrilliam fell</strong> to a psi dominator's axe. Then a stranger floated down from the warship's rail: <strong>Tim the Temporal</strong>, the <em>Widow</em>'s prisoner, who killed two duergar with a thought."
        },
        {
          type: "letter",
          title: "The Grinning Widow Letters",
          date: "~Summertide 29",
          place: "grinning-widow",
          from: "Captain Kree of the <em>Iron Wave</em>, and Ruxithid the Chosen",
          to: "Captain Thrunbar of the <em>Grinning Widow</em>",
          quotes: [
            "“Under his command, I will escort him to Wave Echo to retrieve the Black Shard.” — Kree",
            "“Our Illithid master… now holds the Black Shard in his possession. He will likely return here to Zarzula's Rest or make his way to Ch'chitl.” — Ruxithid",
            "“He has spoken of visiting mercenaries who will soon become Realm Touched… a military division of Calimshan known as the Bridge Builders.” — Ruxithid"
          ],
          text: "Suvresk calls the shard the key to the duergar's \"ascension\". General Vlorluc of Eel Maw promised Suvresk's ships safe passage, and warned of a heretic kuo-toa faith called <strong>Pishooroohl</strong>. The Black Spider was \"no more\". <strong>Toc's old enemies, the Bridge Builders, are joining Suvresk.</strong>"
        },
        {
          type: "note",
          title: "First Night on the Loch",
          date: "~Summertide 29",
          place: "first-rest",
          text: "With the <em>Widow</em> burning behind them, the bois took the <strong>arcane sloop</strong> north through the narrow channels and out onto the open <strong>Black Loch</strong>. They hauled up on a stony beach on the southern shore for their <strong>first full night's rest in the Underdark</strong>: no sky, no dawn, only black water in every direction."
        }
      ]
    },

    /* ───────────────────────────── II ───────────────────────────── */
    {
      numeral: "II",
      title: "Charwall",
      subtitle: "The dragon's pilgrims · the Blood-Eye Ruby · the stolen rod",
      entries: [
        {
          type: "note",
          title: "Umber Hulks on the Isle of Ash",
          date: "~Summertide 30",
          place: "isle-ash",
          text: "Crossing the Loch to the north-east, the bois made camp on the <strong>Isle of Ash</strong>, a stone's throw from Charwall. In the middle of their long rest, the rock split open and <strong>umber hulks</strong> burst out, their eyes scrambling every mind that met them. The bois survived, but nobody slept well."
        },
        {
          type: "note",
          title: "The Village in the Burnt Fortress",
          date: "~Highsun 1",
          place: "charwall",
          text: "Before going in, the bois <strong>anchored the arcane sloop out on the water</strong> and left it behind: a crystal-driven boat of Zarzula's Rest would only bring trouble.<br><br><strong>Charwall</strong> is the roofless, fire-blackened ruin of an ancient dwarven fortress on a small island. Dragonborn and kobolds live there, drawn by a pull they can't explain to worship the red dragon <strong>Kaliphex</strong>. The bois came for <strong>healing</strong> from the cleric <strong>Karragos</strong>, and paid at the Shrine of the Everlasting Scale. Toc was refused entry and slipped in unseen.<br><br>Drow of <strong>Bregan D'aerthe</strong> were already there, led by <strong>Vel'ryn Do'Urden</strong>. They had paid Charwall's clerics to free a captured duergar from its mind-binding crystal in a three-day ritual."
        },
        {
          type: "note",
          title: "Charwall Turns",
          date: "~Highsun 2",
          place: "charwall",
          text: "Then everything went wrong. The kobold elder <strong>Nix-Vex</strong> crumbled into sand in front of witnesses, and the kobolds screamed that \"an agent of a dao\" walked among them. Raven Steve flew off carrying a ring that held something of Nix-Vex. The scrying of Charwall's dragonborn saw through a disguise. Suspicion closed in from every side, and in the middle of it the bois stole Charwall's sacred <strong>Blood-Eye Ruby</strong>."
        },
        {
          type: "scene",
          title: "Escape from Charwall",
          date: "~Highsun 3",
          place: "charwall",
          img: "assets/scenes/escape-charwall-v1.jpg",
          alt: "On a drow ship, Vel disarms Seb of a golden rod from behind while Toc aims at dragonborn on a burning shore.",
          text: "<strong>Hook horrors</strong> broke into the village while the bois fought <strong>Vel's drow</strong> and <strong>Charwall's dragonborn</strong> at the same time. The dragonborn <strong>Vorsakh</strong> melted a drow with acid. The bois seized <strong>Vel's ship</strong>, and while Seb drove it from shore, Vel stepped out of the shadows behind him and took the <strong>Rod of Skyfire</strong>. Toc, drawing on the dragonborn, never saw it happen."
        },
        {
          type: "note",
          title: "The Blood-Eye Ruby",
          date: "~Highsun 3",
          place: "ruby-beach",
          text: "On the beach across the strait from Charwall, the bois <strong>began to consume the Blood-Eye Ruby</strong> they had stolen. It mends them: their <strong>healing runs deeper</strong> than it should. But it ties them to its old owners, too. The <strong>Kaliphex cultists can scry on them far more easily</strong> now."
        },
        {
          type: "note",
          title: "The Booby-Trapped Sloop",
          date: "~Highsun 3",
          place: "sloop-trap",
          text: "They went back for the <strong>arcane sloop</strong> where they had left it in the waters below Charwall. The cultists had found it first. <strong>Glyphs</strong> were laid into the ship, and when the bois took it, a <strong>fireball</strong> tore across the deck, burning the bois and scorching the hull. They sailed it away anyway."
        },
        {
          type: "note",
          title: "Rest Behind the Dragon's Isle",
          date: "~Highsun 3",
          place: "kaliphex-isle",
          text: "They made camp on the <strong>far side of the isle where the red dragon Kaliphex sleeps</strong>, as far from the mouth of the lair as the island allows. No dragon came, but every ember of the campfire felt like it was being watched."
        }
      ]
    },

    /* ───────────────────────────── III ───────────────────────────── */
    {
      numeral: "III",
      title: "The Crystal and the Manse",
      subtitle: "A swallowed crystal · the mists · Delaro Omnibras",
      entries: [
        {
          type: "note",
          title: "Ambush off Zarzula's Rest",
          date: "~Highsun 4",
          place: "zarzula-waters",
          text: "Heading west toward the mists, the bois crossed the waters off <strong>Zarzula's Rest</strong> and ran into duergar boats again. They fought, and the battered <strong>arcane sloop finally sank</strong>. In the fight, <strong>Stor</strong> pried a green crystal out of a duergar jetboat's engine, crushed it, and <strong>swallowed it</strong>. Its effects would show themselves later."
        },
        {
          type: "note",
          title: "Into the Mist",
          date: "~Highsun 4",
          place: "delaro",
          text: "Fleeing onward, the bois sailed into a <strong>magical mist</strong>. Inside it, they found an island and a manse full of eyes, crystals and mirrors: the home of the archmage diviner <strong>Delaro Omnibras</strong>, who was away walking the planes. Once ashore, a <strong>divination barrier</strong> stopped them teleporting out."
        },
        {
          type: "scene",
          title: "The Attic of Delaro's Manse",
          date: "~Highsun 4–6",
          place: "delaro",
          img: "assets/scenes/delaro-manse-attic-v1.jpg",
          alt: "In a wizard's attic, Thrak leaps out a window from shadow copies, Immeral brawls with a crystal golem, Tim reads a diary, and Stor and Seb pore over a book and glowing rods.",
          text: "A painting of several days at once. The Manse made <strong>shadow copies</strong> of Thrak and Immeral. Thrak had left his armour outside, so he <strong>leapt out of a window</strong>. Toc shot the shadows. Immeral traded punches with a <strong>crystal guardian</strong> and kept getting up. Stor and Seb found Delaro's <strong>planar rune book</strong> and his <strong>planar rods</strong>. Tim read Delaro's private diary. And the great <strong>teleportation circle</strong> in the attic was smashed at once, because it looked like a trap."
        },
        {
          type: "note",
          title: "What Delaro's Papers Revealed",
          date: "~Highsun 5",
          place: "delaro",
          text: "• Delaro trained at Candlekeep under the Great Reader <strong>Sibylline Farsight</strong>, and he prays to <strong>Savras</strong>.<br>• He <strong>murdered Doongleblock</strong>, Tim's master, with an extraplanar pathogen, then engineered <strong>Tim's exile</strong> from Candlekeep.<br>• He fears a prophecy: <em>Tim, Destriant of Savras, will slay him beside \"a one-eyed Calimshite, the Shield Anvil of Savras.\"</em><br>• He seeks the <strong>Hall of Pools and Mirrors</strong>, hidden in Candlekeep's deepest vaults.<br>• His former student Anphraxia told him the <strong>Book of Vile Darkness</strong> lies on the Isles of Scorched Bones, in the Plane of Fire. He means to trade that secret to the efreet Vrakir for passage to <strong>Sigil</strong>.<br>• His guardians are simulacra powered by failing Netherese magic."
        },
        {
          type: "note",
          title: "Leaving the Manse",
          date: "~Highsun 6",
          place: "delaro",
          text: "The runebook named three levers in the attic: <strong>blue, silver, gold</strong>. Pulled in order, they brought the barrier down. By the time the bois sailed away, Delaro's Manse lay <strong>partly in ruins</strong>, and they carried off his rune book and rods."
        },
        {
          type: "sending",
          title: "Whispers on the Water",
          date: "~Highsun 6",
          place: "delaro",
          messages: [
            { from: "Forge, to Seb", text: "“I know you lost the rod of skyfire. If my dad finds out, I'm dead and your pact will be broken. Get it back.” Forge's scrying last showed Vel with drow mercenaries and two slaves, sailing among kuo-toa toward a great city, which he believed was <strong>Glogdolp</strong>." },
            { from: "Nowhere", text: "The Harpers won't punish the bois, and won't help them either, unless the bois uncover a threat to the realm like that shard. Judge Pengast followed through: <strong>30,000 gold</strong> on \"the Backstreet Bois, AKA Thrak and Friends, AKA Thrillby and Friends\" in every Lords' Alliance city." },
            { from: "Judge Solomon Pengast", text: "He offers to lift the bounty in exchange for the spell-forge artifact, and for burning a rival winery's estate with the family inside. <strong>Zinfine</strong> has split from him and is hunting the bois herself." },
            { from: "Elvira Shavez, to Thrak", text: "“Clerics in Mithral Hall have tried to contact our brother Thrillby… they say he is dead. What happened, Thrak? What have you done?” She is joining Queen Dagnabit's Deepwatch." }
          ]
        }
      ]
    },

    /* ───────────────────────────── IV ───────────────────────────── */
    {
      numeral: "IV",
      title: "Across the Black Loch",
      subtitle: "Shuushar · Scarhide Yard · House Cultain · the god in the cabin",
      entries: [
        {
          type: "scene",
          title: "The Islet of Shuushar",
          date: "~Highsun 6",
          place: "shuushar-isle",
          img: "assets/scenes/island-rest-shuushar-v1.jpg",
          alt: "The bois sit around a small fire on a glowing island while a smiling kuo-toa sketches a map in the silt beside a small myconid.",
          text: "On a tiny island glowing with crystal and fungus, the bois met <strong>Shuushar the Awakened</strong>, an eloquent and open-minded kuo-toa mystic, and his small myconid friend <strong>Stool</strong>. Shuushar described <strong>Glogdolp</strong>, capital of the kuo-toa <strong>Bluescale Empire</strong>, and the neutral port of <strong>Scarhide Yard</strong>. He gave them an honest warning: his people still demand <strong>sacrifices</strong> from outsiders who want passage. Then he and Stool rowed on ahead."
        },
        {
          type: "scene",
          title: "Scarhide Yard",
          date: "~Highsun 7",
          place: "scarhide",
          img: "assets/scenes/scarhide-barracks-v1.jpg",
          alt: "In a shipyard bunkroom, eyeless grimlocks burst in demanding meat while deep gnomes beg the bois for rations.",
          text: "<strong>Scarhide Yard</strong> is a shipbuilding cavern run by <strong>deep gnomes</strong> and worked by <strong>grimlocks</strong>, the last neutral port before Bluescale waters. Its shipwrights build the crystal-driven sloops and jetboats of Zarzula's Rest, and drow of <strong>House Mizzrym</strong> keep watch on its docks. The gnomes shared their ale, and Shuushar and Stool were there again. Then the grimlocks, who are <strong>paid in food</strong>, burst in demanding <em>flesh</em>. The gnomes had none, so the bois' rations bought the peace."
        },
        {
          type: "scene",
          title: "The Attack on the Cultain Ship",
          date: "~Highsun 7–8",
          place: "cultain-waters",
          img: "assets/scenes/cultain-ship-v1.jpg",
          alt: "A drow captain runs Seb through in mid-air while Tim duels drow wizards on a broom and the others fight drow on a jetboat and a ship's deck.",
          text: "The bois ambushed a trade ship of <strong>House Cultain</strong>, the most powerful drow house on the Black Loch. It was nearly the end of them. In the air, <strong>Captain Urldaar ran Seb through</strong>. On the jetboat, Thrak, Toc and Stor were losing to two drow swordsmen. Immeral held the deck alone inside his spinning shurikens, and Tim duelled two drow wizards from his broom. They won, they <strong>brought Seb back</strong>, and they <strong>took the ship</strong>."
        },
        {
          type: "letter",
          title: "Orders Found on Captain Urldaar",
          date: "~Highsun 8",
          place: "cultain-waters",
          from: "Zadana Cultain, High Priestess of Lolth",
          to: "Captain Urldaar, of House Cultain",
          quotes: [
            "“Be wary of House Mizzrym; they have been active on the Black Loch.”",
            "“Also watch for Suvresk, the mind flayer tied to House Baenre, who has been visiting duergar thralls at Zarzula's Rest.”"
          ],
          text: "Zadana is the daughter of Matron Mother <strong>Azani Cultain</strong>. The letter maps a trade route: <strong>Zarzula's Rest → Ollin's Borehole → Skatha's Rest → Hyphis → the Deep Spire → Vlyn'darastyl</strong>. The cargo is now the bois': perfumes, potions, spirits, magic trinkets and surface goods bought through the Zhentarim."
        },
        {
          type: "scene",
          title: "Savras Speaks",
          date: "~Highsun 8",
          place: "troll-waters",
          img: "assets/scenes/false-savras-v1.jpg",
          alt: "A towering hooded god radiating light speaks to the awed party in a ship's cabin, glowing vision-orbs floating around him.",
          text: "<strong>Sea trolls</strong> rose from the black water. Then <strong>Savras, the All-Seeing</strong>, appeared and unmade them with a word. In the captured ship's cabin he showed the bois <strong>possible futures</strong>, each one glory turning to ruin. He spoke of <em>three shards of midnight stone</em> that <em>\"shall decide the fate of eternity.\"</em> He called Tim and Toc <strong>\"two sons of prophecy\"</strong>, and said: <em>\"The Chosen One holds what was taken.\"</em> He also warned them: <em>\"Trust not all who claim divinity, for even gods may wear masks.\"</em> To Tim he said: <em>\"Ask him who truly answered when he prayed.\"</em>"
        }
      ]
    },

    /* ───────────────────────────── V ───────────────────────────── */
    {
      numeral: "V",
      title: "Glogdolp",
      subtitle: "The kuo-toa capital · Vel · Mr. Bree · the breakout",
      entries: [
        {
          type: "note",
          title: "Envoys and Archpriests",
          date: "~Highsun 8–9",
          place: "glogdolp",
          text: "A <strong>Bluescale envoy</strong> met the bois on the water and brought them into <strong>Glogdolp</strong>, a city of pearl-shell domes and coral platforms. They were received by <strong>Archpriest Galgool</strong> of the old faith of <strong>Ohlavoosha</strong>. The city was splitting in two: Galgool on one side, and on the other the rising cult of <strong>Pishoorooohl</strong> under <strong>Priestess Vloorpaal</strong>. Every outsider who wants passage owes a <strong>sacrifice</strong>. The bois were sent to the <strong>Gutted Fish Inn</strong>."
        },
        {
          type: "scene",
          title: "The Gutted Fish Inn",
          date: "~Highsun 9",
          place: "glogdolp",
          img: "assets/scenes/gutted-fish-inn-v1.jpg",
          alt: "A tense kuo-toa tavern: Seb in drow disguise reaches a truce with Vel at the bar, while a drow points to the door and a rotting duergar watches from a dark hallway.",
          text: "There they cornered <strong>Vel</strong> and his hired drow, <strong>the Blessed Exiles</strong>, led by <strong>Illvara</strong>. It was close to bloodshed, until Seb realised Vel <strong>no longer had the rod</strong>. He had sold it at <strong>Skatha's Rest</strong> to a Zarzula duergar slaver named <strong>Thrunbeard</strong>, and now it lies with <strong>Ruxithid the Chosen</strong> at Zarzula's Rest. Both sides were trapped in a city that wanted them on an altar, so they struck a truce. Immeral charmed <strong>Gloppid</strong>, the innkeeper. The Exiles' wizard <strong>Khalezim</strong> warned Tim to watch a fellow guest."
        },
        {
          type: "note",
          title: "Mr. Bree",
          date: "~Highsun 9–10",
          place: "glogdolp",
          text: "<strong>Mr. Bree</strong> was a friendly duergar scholar staying at the inn to study the kuo-toa. But something in the deep waters had <strong>enslaved him in his sleep</strong>, and he became a wet, rotting, smiling thing that kept trying to lure others below. The bois <strong>killed the body</strong> and caught <strong>Mr. Bree's true soul in a ring of mind shielding</strong>. They carry it still."
        },
        {
          type: "scene",
          title: "Escape from Glogdolp",
          date: "Highsun 10",
          place: "glogdolp",
          img: "assets/scenes/escape-glogdolp-v1.jpg",
          alt: "The bois and Vel fight tentacled kuo-toa horrors aboard a small ship as it breaks past a harbor chain, a vast wall of fanged flesh and siege crabs rising behind them.",
          text: "Illvara performed the cult's <strong>Rite of Blood Melding</strong> and came back <strong>enslaved</strong>. Seb wore her face to lead the escape, and the zealots knew it was false. Glogdolp exploded into <strong>religious civil war</strong>. Galgool's ritual birthed a <strong>wall of living flesh</strong> that swallowed kuo-toa of both faiths as it grew. Some kuo-toa <strong>mutated into horrors</strong> and boarded the ship, and <strong>siege crabs</strong> crushed whichever side their riders hated. Galgool's incantation woke the crystal in Stor, and <strong>half of Stor's face became something from beyond</strong>. With Vel at their side, the bois broke the harbor chain and escaped."
        }
      ]
    },

    /* ───────────────────────────── VI ───────────────────────────── */
    {
      numeral: "VI",
      title: "Zarzula's Rest",
      subtitle: "The fortress of the Chosen",
      entries: [
        {
          type: "note",
          title: "Across the Loch on Vel's Ship",
          date: "Highsun 10",
          place: "zarzula",
          text: "Free of Glogdolp, the bois and <strong>Vel</strong> sailed his ship north-east across the open Loch to <strong>Zarzula's Rest</strong>, a fortress of crystal-thralls on the tip of its own peninsula. Somewhere inside, <strong>Ruxithid the Chosen</strong> holds the Rod of Skyfire."
        },
        {
          type: "note",
          title: "What Vel Said About Luskan",
          date: "Highsun 10",
          place: "zarzula",
          text: "On the crossing, Vel let something slip: <strong>Bregan D'aerthe secretly runs Luskan</strong>, the City of Sails, through its <strong>five High Captains</strong>.<br><br>For Stor, it landed hard. Long ago, <strong>Bhaal</strong> came to him in a dream and named where his family's rapier lies: <strong>Whisper of Endings</strong>, forged from Bhaal's own essence and taken when his father's cult fell. It is aboard <strong>Ship Kurth</strong>, with <strong>Captain Kurth</strong> of Luskan.<br><br>If Luskan's captains answer to Bregan D'aerthe, then so does the man holding Stor's birthright. That is <strong>Vel's own company</strong>."
        },
        {
          type: "scene",
          title: "Assault on the Top Floor",
          date: "After Highsun 10",
          place: "zarzula",
          img: "assets/scenes/assault-zarzulas-rest-v2.jpg",
          alt: "Seen from behind, the bois and Vel stride across a cliff-top terrace toward a fortress gate blazing with forge-light, their magic flaring and their giant shadows looming up the walls, as eagles wheel away below.",
          text: "Zarzula's Rest is a fortress stacked a hundred feet above the water, and <strong>no outsider may enter without Ruxithid's leave</strong>. The bois didn't ask. Toc's <strong>giant eagles</strong> carried them to the top floor, with Vel carrying Thrak, and they walked straight toward the <strong>forge-light blazing through the gate</strong>. The thralls there were human, dwarf and half-elf labourers with <strong>green crystals in their skulls</strong>, and they never stood a chance. The duergar overseers fought harder, and fell anyway."
        },
        {
          type: "scene",
          title: "Downward",
          date: "After Highsun 10",
          place: "zarzula",
          img: "assets/scenes/assault-zarzulas-rest-v1.jpg",
          alt: "The bois and Vel cut through crystal-bound labourers and duergar overseers amid molten-lit walls and dropped tools.",
          text: "Floor by floor, the bois worked their way down, cutting through every thrall who stood in their way. The deeper they went, the more of the thralls were <strong>duergar</strong>, and the closer they came to the volcanic heart of the fortress, and to <strong>Ruxithid</strong>."
        },
        {
          type: "note",
          title: "The Underworks",
          date: "After Highsun 10",
          place: "zarzula",
          text: "At the bottom lie <strong>the Underworks</strong>, home of the duergar thralls and of <strong>Ruxithid the Chosen</strong>."
        },
        {
          type: "here",
          title: "Ruxithid's Bedchamber",
          date: "Now",
          place: "zarzula",
          text: "Through a side entrance, the bois have slipped into the private chamber of <strong>Ruxithid the Chosen</strong>. <em>The Chosen One holds what was taken.</em> The Rod of Skyfire is close."
        }
      ]
    }
  ],

  /* ───────────────────────────── The Web Around Suvresk ─────────────────────────────
     What the bois have pieced together about the mind flayer and the powers tied to him.
     `source` says how they learned it; `ties` are the other cards this one connects to (by id). */
  dossier: {
    title: "The Web Around Suvresk",
    subtitle: "Letters, confessions and things seen with our own eyes, pinned together.",
    cards: [
      {
        id: "suvresk",
        name: "Suvresk",
        role: "Mind flayer · \"the Infinite Mind, Herald of the Far Realm\"",
        source: "The Grinning Widow letters · Zadana's orders · Vel",
        text: "The master behind <strong>Zarzula's Rest</strong>. Captain Kree carried him from Vlyn'darastyl to Zarzula's Rest, then to <strong>Wave Echo Cave</strong> aboard the <em>Iron Wave</em>, where he took the <strong>Black Shard</strong>. He meant to bring it back to Zarzula's Rest or to <strong>Ch'chitl</strong>. He promises his followers they will <em>ascend</em> as <strong>\"Realm Touched\"</strong>. House Cultain calls him <em>\"the mind flayer tied to House Baenre\"</em>.",
        ties: ["zarzula", "bridge", "knife", "baenre", "bregan"]
      },
      {
        id: "zarzula",
        name: "Ruxithid & Zarzula's Rest",
        role: "Suvresk's first thrall and his fortress",
        source: "The Grinning Widow letters · the duergar · our own eyes",
        text: "<strong>Ruxithid the Chosen</strong> rules Zarzula's Rest for Suvresk. Its people, duergar and captured slaves alike, carry <strong>green crystals in their skulls</strong> and obey without question. <strong>No outsider enters without Ruxithid's leave</strong>. His captains: <strong>Thrunbar</strong> of the <em>Grinning Widow</em> and <strong>Kree</strong> of the <em>Iron Wave</em>. The slaver <strong>Thrunbeard</strong> bought Seb's rod from Vel, and Ruxithid holds it now.",
        ties: ["suvresk", "crystals"]
      },
      {
        id: "crystals",
        name: "The Green Crystals",
        role: "Leash, engine and something worse",
        source: "Vel · Glogdolp · Stor",
        text: "The duergar of Zarzula's Rest are their source. <strong>Implanted</strong>, a crystal makes a thrall. <strong>Fitted</strong> into a hull, it drives the arcane sloops and jetboats that <strong>Scarhide Yard</strong> builds for Zarzula's Rest. In Glogdolp, the crystals <strong>turned Ohlavoosha's faithful into monsters</strong>, and woke the one Stor swallowed. Vel is now convinced that what the kuo-toa worship as <strong>Ilvooshooo</strong> is <strong>real</strong>, and that the crystals are its instrument.",
        ties: ["zarzula", "suvresk"]
      },
      {
        id: "bridge",
        name: "The Bridge Builders",
        role: "A division of Calimshan's 2nd Army, the army Toc scouted for",
        source: "Ruxithid's letter to Thrunbar · Toc",
        text: "A military division in <strong>Calimshan's 2nd Army</strong> (Onearm's Host), the army in which Toc served as a ranger and scout-major. It is commanded by the war-wizard <strong>Azer</strong>. Ruxithid wrote of <em>\"visiting mercenaries who will soon become Realm Touched… a military division of Calimshan known as the Bridge Builders.\"</em> The men who carried his letter were already Realm Touched. Part of Toc's old army has <strong>thrown in with a mind flayer</strong>.",
        ties: ["suvresk", "knife"]
      },
      {
        id: "knife",
        name: "The Amethyst Knife",
        role: "Psionic soldiers, once \"the 9th Squad\" of the Bridge Builders",
        source: "Vel",
        text: "Once the <strong>9th Squad</strong> of the <strong>Bridge Builders</strong> division. At Zarzula's Rest, <strong>Suvresk personally granted them entry</strong> and filled them with psionic power, and they took a new name. They still answer to <strong>Azer</strong>, the Bridge Builders' war-wizard in Calimshan. Vel was sent to find out how they fit into Suvresk's web.",
        ties: ["suvresk", "bridge", "bregan"]
      },
      {
        id: "bregan",
        name: "Bregan D'aerthe",
        role: "Houseless drow mercenaries · Vel's company",
        source: "Vel",
        text: "A drow mercenary company led by <strong>Jarlaxle Baenre</strong>. Vel says it also <strong>secretly runs Luskan</strong> through the city's five High Captains. Its Black Loch operation runs from a hidden cavern beside <strong>Vlyn'darastyl</strong>, commanded by <strong>Bruhd Do'Urden</strong>, Vel's elder brother. They <strong>escorted Suvresk</strong> on his travels, and they grew <strong>suspicious of him</strong>. Vel's crew was sent to learn <strong>what Suvresk is really doing</strong>: capture a crystal-thralled duergar, have Charwall's clerics free its mind, and question it. The bois' arrival at Charwall wrecked that.<br><br>Now that Vel knows about the <strong>Black Shard</strong> and Suvresk's part in taking it, his suspicion has sharpened. <strong>Bruhd, and Jarlaxle himself</strong>, want him to <strong>go into Zarzula's Rest and uncover the plot</strong>.",
        ties: ["baenre", "suvresk", "luskan"]
      },
      {
        id: "luskan",
        name: "Luskan & Ship Kurth",
        role: "The City of Sails, and its hidden masters",
        source: "Bhaal's dream (Stor) · Vel",
        text: "Luskan is ruled by <strong>five High Captains</strong>, pirate lords whose factions are called <strong>Ships</strong>. Vel says <strong>Bregan D'aerthe secretly runs the city through them</strong>. One of the five is <strong>Captain Kurth</strong> of <strong>Ship Kurth</strong>, and Bhaal told Stor that Kurth holds his family's rapier, <strong>Whisper of Endings</strong>. Whatever Captain Kurth is, he answers to Bregan D'aerthe.",
        ties: ["bregan"]
      },
      {
        id: "baenre",
        name: "House Baenre",
        role: "First House of Menzoberranzan",
        source: "Vel · Zadana's orders",
        text: "House Cultain calls Suvresk <em>\"the mind flayer tied to House Baenre\"</em>, and he presents himself as <strong>loyal to the First House</strong>. Bregan D'aerthe's leader, <strong>Jarlaxle</strong>, was born a Baenre. The house's reach on the Loch also runs through its ally <strong>House Mizzrym</strong>, whose watchers we met at <strong>Scarhide Yard</strong>, and whose hold is at Spyr-Anaisz.",
        ties: ["bregan", "cultain", "suvresk"]
      },
      {
        id: "cultain",
        name: "House Cultain",
        role: "Rulers of Vlyn'darastyl · Lolth-sworn",
        source: "Zadana's orders to Captain Urldaar · Vel",
        text: "Matron Mother <strong>Azani Cultain</strong> rules Vlyn'darastyl. Her daughter <strong>Zadana</strong>, High Priestess of Lolth, sends trade ships across the Loch. Cultain buys its surface goods through the <strong>Zhentarim</strong>, warns its captains about <strong>House Mizzrym</strong>, and pays for any word of <strong>Suvresk</strong>. It resents Baenre's shadow over its city. It is also missing a ship, which the bois took.",
        ties: ["zhent", "baenre"]
      },
      {
        id: "zhent",
        name: "The Zhentarim",
        role: "The Black Network, below the earth",
        source: "Vel · Zadana's orders",
        text: "House Cultain's trade partners, with an outpost in Vlyn'darastyl's slums that supplies the drow with surface goods. Somehow they are tangled in Suvresk's web too. Vel's original question still stands: <strong>why are the Zhentarim keeping Suvresk's business secret from House Cultain</strong>, their own trade partner?",
        ties: ["cultain", "suvresk"]
      }
    ]
  },

  /* ───────────────────────────── The Ledger ───────────────────────────── */
  ledger: [
    {
      title: "What We Seek",
      icon: "✦",
      items: [
        "<strong>Seb's Rod of Skyfire</strong>: held by Ruxithid the Chosen at Zarzula's Rest. Forge warns that if it isn't recovered, Seb's pact breaks.",
        "<strong>The Black Shard</strong>: taken from Wave Echo by the mind flayer Suvresk. Savras: <em>three shards shall decide the fate of eternity.</em>",
        "<strong>Delaro Omnibras</strong>: Tim's master's murderer. Savras: ask him <em>who truly answered when he prayed</em>.",
        "<strong>A cure, or an answer,</strong> for the crystal in Stor.",
        "<strong>Whisper of Endings</strong>: Stor's family rapier, forged from Bhaal's essence. Aboard Ship Kurth, with Captain Kurth of Luskan, and so in Bregan D'aerthe's hands."
      ]
    },
    {
      title: "Who Hunts Us",
      icon: "⚔",
      items: [
        "<strong>The Lords' Alliance</strong>: a 30,000 gp bounty through Judge Pengast and Lord Neverember.",
        "<strong>Zinfine Faleth</strong>: hunting the bois on her own.",
        "<strong>Charwall's dragonborn</strong>: they want the Blood-Eye Ruby back.",
        "<strong>House Cultain</strong>: their ship is missing.",
        "<strong>The Pishoorooohl cult</strong> of Glogdolp, and whatever it serves below.",
        "<strong>Elvira Shavez</strong>: she may be sent after Thrak."
      ]
    },
    {
      title: "Friends, of a Sort",
      icon: "☩",
      items: [
        "<strong>Vel'ryn Do'Urden</strong>: thief of the rod, now fighting beside us.",
        "<strong>Shuushar the Awakened</strong> and <strong>Stool</strong>: honest guides to the Loch.",
        "<strong>Forge</strong>: scrying for Seb.",
        "<strong>Nowhere</strong>: will help, but only against a threat to the realm.",
        "<strong>Gloppid</strong> of the Gutted Fish: very fond of Immeral."
      ]
    },
    {
      title: "Powers of the Black Loch",
      icon: "◈",
      items: [
        "<strong>Suvresk</strong>: a mind flayer, \"the Infinite Mind\", master of Zarzula's Rest, tied to House Baenre. Bregan D'aerthe doesn't trust him.",
        "<strong>Ruxithid the Chosen</strong>: his first thrall. He holds the rod.",
        "<strong>The Bridge Builders</strong>: Azer's division of Calimshan's 2nd Army, Toc's old army, joining Suvresk as \"Realm Touched\". Their 9th Squad is now the <strong>Amethyst Knife</strong>.",
        "<strong>House Cultain</strong> (Matron Azani, Zadana) of Vlyn'darastyl, and <strong>House Mizzrym</strong>, watching from Scarhide.",
        "<strong>The Bluescale Empire</strong>, at war with itself: Ohlavoosha against Pishoorooohl. General Vlorluc of Eel Maw gives Suvresk's ships safe passage."
      ]
    },
    {
      title: "What We Carry",
      icon: "⚱",
      items: [
        "<strong>The Blood-Eye Ruby</strong>, partly consumed: deeper healing, but easier scrying for the Kaliphex cultists.",
        "<strong>Mr. Bree's soul</strong>, inside a ring of mind shielding.",
        "<strong>Delaro's planar rune book</strong> and <strong>planar rods</strong>.",
        "<s class=\"struck\"><strong>The Cultain ship's cargo.</strong></s> <span class=\"correction\">Left the cargo at Glogdolp</span>",
        "<strong>The Grinning Widow letters</strong> and <strong>Zadana's orders</strong>."
      ]
    },
    {
      title: "Open Questions",
      icon: "?",
      items: [
        "Where is the Black Shard now: Zarzula's Rest, or Ch'chitl?",
        "<em>\"Even gods may wear masks.\"</em> Whose mask?",
        "How much can Charwall's scryers see of us, now that the Ruby is in us?",
        "Why do the Zhentarim keep Suvresk's business secret from House Cultain?",
        "Will the crystal in Stor ever let him go?",
        "Immeral's gods: free Shaundakul from the God Tree, or keep feeding Priapus?",
        "What crawled out of the Shadowfell beneath the Loch?",
        "Why do the Bridge Builders serve a mind flayer?",
        "Who is Captain Kurth, really? And what will Bregan D'aerthe do when Stor comes for the blade?"
      ]
    }
  ]
};
