/*
  THE COMPANY — character profiles for company.html
  PLAYER-FACING ONLY: what the party knows about itself and its allies. No DM secrets.

  Each profile: { id, name, epithet, tags[], portrait, sheet, bio, facts[], quote?, status? }
    portrait – cropped face study (assets/people/<id>-portrait.jpg)
    sheet    – full reference sheet shown when the portrait is clicked
*/
window.COMPANY = {
  party: [
    {
      id: "thrak",
      name: "Thrak Shavez",
      epithet: "Knight of Mithral, sworn to vengeance",
      tags: ["Dwarf", "Paladin · Oath of Vengeance", "Moradin"],
      bio: "A dwarf of the <strong>Shavez clan</strong> and a <strong>Knight of Mithral</strong>, sworn to Moradin under an Oath of Vengeance. He is the company's armoured wall and its battering ram. Thrak joined the bois at the Triboar camp and has been walking into the worst of it at the front ever since.",
      facts: [
        "Fights with shield and warhammer. The hammer is chained to his belt, and it crackles with lightning when he smites.",
        "His sister <strong>Elvira</strong> is joining Queen Dagnabit's Deepwatch, and Mithral Hall says their brother is dead.",
        "Savras showed him Mithral Hall swallowed by madness."
      ],
      status: "With the company"
    },
    {
      id: "stor",
      name: "Stor Lackman",
      epithet: "Face, scoundrel, and something more",
      tags: ["Human of Luskan", "Rogue · Arcane Trickster"],
      bio: "A charming, dangerous rogue from <strong>Luskan</strong>, all crooked grins and quick blades. He picks locks with a spectral hand and talks the bois into, and out of, trouble. Off Zarzula's Rest he <strong>swallowed a crushed green crystal</strong>, and in Glogdolp it woke: half his face is no longer entirely his own.",
      facts: [
        "Carries lasting wounds from the duergar ambush on the river.",
        "The crystal in him pulls toward the Far Realm, and he is still fighting it.",
        "Savras showed him ruling Baldur's Gate's underworld, and the city burning."
      ],
      status: "With the company, partly transformed"
    },
    {
      id: "seb",
      name: "Seb",
      epithet: "\"Sebastian Lockwood\": warlock and shapeshifter",
      tags: ["Changeling", "Warlock", "Pact with a genie lord"],
      bio: "Always the best-dressed man in the room. When it suits him, he is someone else entirely: a drow at the Gutted Fish Inn, or <strong>Illvara</strong> herself in the flight from Glogdolp. He commands golden sand and eldritch fire, and his familiar, <strong>Raven Steve</strong>, is never far away.",
      facts: [
        "Lost his <strong>Rod of Skyfire</strong> to Vel at Charwall. Forge warns that his pact breaks if it isn't recovered.",
        "Run through in mid-air by Captain Urldaar of House Cultain. He died, and the bois brought him back.",
        "Savras showed him wealthy in Waterdeep, then a Shadow Thieves blade."
      ],
      status: "With the company, hunting his rod"
    },
    {
      id: "immeral",
      name: "Immeral",
      epithet: "Cleric of the Windlord",
      tags: ["Moon Elf", "Cleric", "Shaundakul"],
      bio: "A blue-skinned moon elf cleric of <strong>Shaundakul</strong>, god of travel and the wind. Behind his round spectacles is a quiet authority, and a stubborn refusal to stay down, as a crystal guardian learned the hard way. He wears <strong>duergar half-plate</strong> that does not fit him, and his spirit guardians whirl around him as a storm of <strong>golden shurikens</strong>.",
      facts: [
        "His magical mace doubles as the company's lantern in the deep.",
        "Gloppid, innkeeper of the Gutted Fish, is very fond of him.",
        "Savras showed him as High Cleric in Silverymoon, then bound in silver thorns in a fey grove."
      ],
      status: "With the company"
    },
    {
      id: "toc",
      name: "Toc the Younger",
      epithet: "One-eyed scout of the 2nd Army",
      tags: ["Calishite Human", "Ranger", "Longbow"],
      bio: "A veteran <strong>scout-major of Calimshan's 2nd Army</strong> (Onearm's Host), born in Volothamp and raised on the streets of Calimport. He lost his <strong>left eye</strong> at the Siege of Volothamp, and the empty socket itches with glimpses of things to come. He is a deadly archer and tracker who keeps watch while the others talk.",
      facts: [
        "Called the <strong>giant eagles</strong> that carried the bois up to Zarzula's Rest.",
        "Savras named him and Tim <strong>\"two sons of prophecy\"</strong>.",
        "Delaro's papers fear a <em>\"one-eyed Calimshite, the Shield Anvil of Savras\"</em>.",
        "The Grinning Widow letters say his old division, the <strong>Bridge Builders</strong>, is joining Suvresk."
      ],
      status: "With the company"
    },
    {
      id: "tim",
      name: "Tim the Temporal",
      epithet: "Exiled diviner of Candlekeep",
      tags: ["Human", "Wizard · Divination", "Savras"],
      bio: "A diviner of <strong>Candlekeep</strong> and a worshipper of <strong>Savras</strong>. He was a prisoner in the hold of the <em>Grinning Widow</em> until he floated down into the battle and killed two duergar with a thought. Since then he has flown with the bois on his broom, reading futures in his crystal orb.",
      facts: [
        "At Delaro's Manse he learned that <strong>Delaro Omnibras murdered his master, Doongleblock</strong>, and engineered his exile.",
        "Delaro fears a prophecy that Tim, <em>Destriant of Savras</em>, will slay him.",
        "Savras told him: <em>\"Ask him who truly answered when he prayed.\"</em>"
      ],
      status: "With the company"
    }
  ],

  npcs: [
    {
      id: "vel",
      name: "Vel'ryn Do'Urden",
      epithet: "Drow duellist of Bregan D'aerthe",
      tags: ["Drow", "Duellist", "Bregan D'aerthe"],
      bio: "A polished, persuasive drow mercenary of <strong>Bregan D'aerthe</strong>. He came to Charwall to have a crystal-bound duergar freed for questioning, and left with <strong>Seb's Rod of Skyfire</strong>. The bois chased him to Glogdolp, only to learn he had already <strong>sold the rod</strong> to a Zarzula slaver named Thrunbeard. Trapped together in a city that wanted them all on an altar, they made a truce.",
      facts: [
        "Fought beside the bois in the Glogdolp breakout.",
        "Carried Thrak up the cliff to Zarzula's Rest."
      ],
      status: "With the company, for now"
    },
    {
      id: "falcon",
      name: "The Falcon",
      epithet: "Gustaf Halfdane, hunter of Neverwinter Wood",
      tags: ["Human of Luskan", "Huntsman", "Greatsword & bow"],
      bio: "A former Luskan privateer turned huntsman, and master of the <strong>Falcon Lodge</strong> in Neverwinter Wood, until a Cult of Talos and its orcs seized it. The bois talked him into joining the strike on Wave Echo Cave, on the promise that they would help him take back his lodge.",
      facts: [
        "Fought beside the bois against the duergar at Wave Echo Cave.",
        "Chose to stay behind on the dock as they sailed into the Underdark."
      ],
      status: "Last seen: Wave Echo Cave"
    },
    {
      id: "nowhere",
      name: "Nowhere Silvertail",
      epithet: "Harper Moon-Shadow",
      tags: ["Tiefling", "Blade & flute", "Harpers"],
      bio: "A sly young tiefling who fights with longsword and shield and carries a flute at his belt. He first appeared helping the bois clear out the Redbrands. He is a <strong>Moon-Shadow</strong> of the Harpers, the agent sent on the jobs the Harpers would rather not put their name to.",
      facts: [
        "Stayed behind at Wave Echo Cave with the Falcon.",
        "Now runs a Moon-Shadow cell in <strong>Waterdeep</strong>.",
        "His last Sending: the Harpers won't help, unless the bois uncover a real threat to the realm."
      ],
      status: "Last heard: Waterdeep, by Sending"
    }
  ]
};
