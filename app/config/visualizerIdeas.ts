/*
 * Visualizer ideas for /music-videos/ideas — GENERATED, do not edit.
 *
 * Written by `SITE=1 node tools/video-styles/visualizers/build.mjs` from the
 * concept modules in tools/video-styles/visualizers/, along with every still
 * under public/video-styles/ideas/. Change a module and run that again.
 */

export interface IdeaStill { time: number; line: string; src: string }
export interface VisualizerIdea { id: string; name: string; lyric: string; idea: string; motion: string; red: string; stills: IdeaStill[] }
export interface SongIdeas { slug: string; track: number; title: string; core: string; concepts: VisualizerIdea[] }

export const ANDALUSIA_REFERENCE: IdeaStill[] = [
  {
    "time": 20,
    "line": "Oh, I think that I could live in Andalusia",
    "src": "/video-styles/ideas/andalusia-1.svg"
  },
  {
    "time": 45,
    "line": "I'd sit and watch the sailors in the cold",
    "src": "/video-styles/ideas/andalusia-2.svg"
  },
  {
    "time": 80,
    "line": "Bangkok, Budapest, or Baton Rouge",
    "src": "/video-styles/ideas/andalusia-3.svg"
  }
]

export const VISUALIZER_IDEAS: SongIdeas[] = [
  {
    "slug": "into-the-wild",
    "track": 1,
    "title": "Into the Wild",
    "core": "Adventure",
    "concepts": [
      {
        "id": "off-the-grid",
        "name": "Off the Grid",
        "lyric": "Oh, I'm tired of all the conjecture / Dreaming and scheming and goals",
        "idea": "A town plan that frays into a contour map. Streets on a grid, hatched blocks, then the grid runs out and the land is hills drawn as contours. The schemes and goals are the grid; the wild is everything past it.",
        "motion": "The camera pans east with the route the whole song. Verses walk, every chorus runs (the pan more than doubles on \"running\"), the solo is open country, and the outro slows to a stop in the hills.",
        "red": "The route. It keeps to the streets at right angles while it is in town, then wanders like water once it is out.",
        "stills": [
          {
            "time": 24,
            "line": "To see if I can't lose my way",
            "src": "/video-styles/ideas/into-the-wild/off-the-grid-1.svg"
          },
          {
            "time": 77,
            "line": "All that it creates is pressure",
            "src": "/video-styles/ideas/into-the-wild/off-the-grid-2.svg"
          },
          {
            "time": 120,
            "line": "",
            "src": "/video-styles/ideas/into-the-wild/off-the-grid-3.svg"
          },
          {
            "time": 186,
            "line": "So I'm running into the wild",
            "src": "/video-styles/ideas/into-the-wild/off-the-grid-4.svg"
          }
        ]
      },
      {
        "id": "needle",
        "name": "The Wandering Needle",
        "lyric": "Where I'll end up, I don't know",
        "idea": "One compass card filling the plate, and a needle that won't settle. Every word sung leaves a tick on the rim where the needle was pointing, so by the end it has pointed everywhere.",
        "motion": "The needle drifts through the verses, swings round hard in every chorus, and the card rocks in its bowl. The ticks build up, darkest where the song lingered.",
        "red": "The north half of the needle, the only thing in the frame that never stops moving.",
        "stills": [
          {
            "time": 21,
            "line": "To see if I can't lose my way",
            "src": "/video-styles/ideas/into-the-wild/needle-1.svg"
          },
          {
            "time": 50,
            "line": "So I'm running into the wild",
            "src": "/video-styles/ideas/into-the-wild/needle-2.svg"
          },
          {
            "time": 90,
            "line": "From the tales that my life's taught to me",
            "src": "/video-styles/ideas/into-the-wild/needle-3.svg"
          },
          {
            "time": 168,
            "line": "I mean glaciers and gardens and grottos",
            "src": "/video-styles/ideas/into-the-wild/needle-4.svg"
          }
        ]
      },
      {
        "id": "cabinet",
        "name": "Cabinet of Splendours",
        "lyric": "And stumble upon all the splendorous things / The gods hid about when they made",
        "idea": "A naturalist's plate of fourteen empty boxes. Each one is engraved in the moment the song names it: water, iron, ebony, ivory, bone, then glaciers, gardens, grottos, sage, a harbour, a crowd.",
        "motion": "Nothing moves except the things being found. Each specimen draws itself on over a second and a half from its own word, so the plate fills in the order the song finds it.",
        "red": "A thread pinned from each find to the next, like a collector tracing the route, slung across the plate as each new box opens.",
        "stills": [
          {
            "time": 38,
            "line": "Ebony, ivory, and bone",
            "src": "/video-styles/ideas/into-the-wild/cabinet-1.svg"
          },
          {
            "time": 98,
            "line": "And put them in songs that I sing",
            "src": "/video-styles/ideas/into-the-wild/cabinet-2.svg"
          },
          {
            "time": 170,
            "line": "I mean glaciers and gardens and grottos",
            "src": "/video-styles/ideas/into-the-wild/cabinet-3.svg"
          },
          {
            "time": 190,
            "line": "Oh, I'm running",
            "src": "/video-styles/ideas/into-the-wild/cabinet-4.svg"
          }
        ]
      },
      {
        "id": "profile",
        "name": "Elevation Profile",
        "lyric": "Oh, I'm headed out on an adventure",
        "idea": "The song drawn as a day on the trail: a hiker's elevation profile, kilometres along the bottom and metres up the side. Verses roll, choruses climb, the solo is the summit ridge and the outro walks down.",
        "motion": "A red pen draws the profile left to right in time with the record, with the camera following it. Each thing the song names is flagged as a waypoint where it was sung. Nothing is drawn ahead of the pen.",
        "red": "The pen and the last few seconds of the line behind it.",
        "stills": [
          {
            "time": 30,
            "line": "The gods hid about when they made",
            "src": "/video-styles/ideas/into-the-wild/profile-1.svg"
          },
          {
            "time": 52,
            "line": "Oh, I'm running",
            "src": "/video-styles/ideas/into-the-wild/profile-2.svg"
          },
          {
            "time": 158,
            "line": "Where I'll end up, I don't know",
            "src": "/video-styles/ideas/into-the-wild/profile-3.svg"
          },
          {
            "time": 190,
            "line": "Oh, I'm running",
            "src": "/video-styles/ideas/into-the-wild/profile-4.svg"
          }
        ]
      },
      {
        "id": "road",
        "name": "The Open Road",
        "lyric": "So I'm running into the wild",
        "idea": "One-point perspective and nothing else: a road to the horizon, fence posts and centre dashes coming at you. The horizon changes country with each verse, from plains to mountains to ice.",
        "motion": "Dashes pass at a walking pace in the verses and twice as fast on every \"running\". The horizon dissolves from one country to the next across a verse boundary, with no cut.",
        "red": "The centre line. It is the only red in the frame and the only thing that tells you how fast you are going.",
        "stills": [
          {
            "time": 20,
            "line": "Oh, I'm headed out on an adventure",
            "src": "/video-styles/ideas/into-the-wild/road-1.svg"
          },
          {
            "time": 49,
            "line": "So I'm running into the wild",
            "src": "/video-styles/ideas/into-the-wild/road-2.svg"
          },
          {
            "time": 100,
            "line": "So I'm running into the wild",
            "src": "/video-styles/ideas/into-the-wild/road-3.svg"
          },
          {
            "time": 170,
            "line": "I mean glaciers and gardens and grottos",
            "src": "/video-styles/ideas/into-the-wild/road-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "conman",
    "track": 2,
    "title": "Conman",
    "core": "Stealing",
    "concepts": [
      {
        "id": "cooked-books",
        "name": "Cooked Books",
        "lyric": "I've made a killing off of moving fast and cooking books",
        "idea": "A ledger page with two columns, Yours and Mine. Every sung line is one entry: what he took is written in, the figure under Yours is struck through in red, and the same figure appears under Mine. Every chorus line is the same entry for the same amount, 1,968.00, because he always sounds the same.",
        "motion": "The page climbs one row per line and glides between them, so it never stops. Each entry is written out across its line, and the strike lands on the line's last word. The red balance at the foot counts up all song.",
        "red": "The thief's ink: the strike through your figure, the copy in his column and the balance carried forward.",
        "stills": [
          {
            "time": 41,
            "line": "And pulled the clouds into the sea to clear the sky of smoke, you know",
            "src": "/video-styles/ideas/conman/cooked-books-1.svg"
          },
          {
            "time": 74,
            "line": "I started searching and I finally realized",
            "src": "/video-styles/ideas/conman/cooked-books-2.svg"
          },
          {
            "time": 125,
            "line": "No matter where I go, I never seem to change",
            "src": "/video-styles/ideas/conman/cooked-books-3.svg"
          },
          {
            "time": 223,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/cooked-books-4.svg"
          }
        ]
      },
      {
        "id": "pantograph",
        "name": "The Pantograph",
        "lyric": "I'm a conman and I'm here to steal your sound",
        "idea": "A forger's copying machine. Its stylus traces your sound, printed as a small waveform of the whole song along the foot of the plate, and its pen draws the same waveform five times larger in red above it. Whatever the stylus has passed over fades out of the original.",
        "motion": "The carriage runs along the rail at the song's pace, so the stylus is always at the point being played, and the linkage folds and opens as the waveform rises and falls. By the end the original is a ghost and the copy is whole.",
        "red": "The pen, and the copy it lays down.",
        "stills": [
          {
            "time": 36,
            "line": "Bottled lightning in several steady notes",
            "src": "/video-styles/ideas/conman/pantograph-1.svg"
          },
          {
            "time": 100,
            "line": "I'm a conman and I'm here to steal your sound",
            "src": "/video-styles/ideas/conman/pantograph-2.svg"
          },
          {
            "time": 173,
            "line": "Watch me split the ground and pierce the sky and find a groove",
            "src": "/video-styles/ideas/conman/pantograph-3.svg"
          },
          {
            "time": 225,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/pantograph-4.svg"
          }
        ]
      },
      {
        "id": "bottled-lightning",
        "name": "Bottled Lightning",
        "lyric": "Bottled lightning in several steady notes",
        "idea": "One engraved bottle standing in the sea under a cloudy sky. Each line is a lightning strike that goes in at the neck and stays inside as a small red bolt. The clouds are pulled away one by one until the sky is clear.",
        "motion": "Strikes land on the first word of each line. The bolts already inside flicker with the band, the clouds drift and thin out across the song, and the sea keeps moving. By the last chorus the bottle is full of red and the sky is empty.",
        "red": "The lightning: taken from the sky and kept.",
        "stills": [
          {
            "time": 35,
            "line": "Bottled lightning in several steady notes",
            "src": "/video-styles/ideas/conman/bottled-lightning-1.svg"
          },
          {
            "time": 80,
            "line": "No matter where I go, I never seem to change",
            "src": "/video-styles/ideas/conman/bottled-lightning-2.svg"
          },
          {
            "time": 135,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/bottled-lightning-3.svg"
          },
          {
            "time": 225,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/bottled-lightning-4.svg"
          }
        ]
      },
      {
        "id": "same-print",
        "name": "The Same Print",
        "lyric": "No matter where I go, I never seem to change",
        "idea": "A police ten-print card for the conman. One finger is rolled for each section of the song, and all ten prints are the same print. A clerk stamps SAME on each one, and red rings mark the points that match.",
        "motion": "Each print rolls on from left to right as its section starts. The camera leans from box to box along the card, and between prints a red line works its way across from the matched point on the last print to the same point on the new one.",
        "red": "The match: rings on the matching points and the line that joins print to print.",
        "stills": [
          {
            "time": 30,
            "line": "These rhythms' been around since 1968 when they",
            "src": "/video-styles/ideas/conman/same-print-1.svg"
          },
          {
            "time": 82,
            "line": "No matter where I go, I never seem to change",
            "src": "/video-styles/ideas/conman/same-print-2.svg"
          },
          {
            "time": 168,
            "line": "Oh, I'm a conman, don't be fooled by the way I move",
            "src": "/video-styles/ideas/conman/same-print-3.svg"
          },
          {
            "time": 224,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/same-print-4.svg"
          }
        ]
      },
      {
        "id": "shadows",
        "name": "In the Shadows",
        "lyric": "I stick to the shadows when I follow you around",
        "idea": "A town plan seen from above, with every building casting a hatched shadow. Your walk is a dotted ink line through the streets. A red line follows a few blocks behind, and it keeps to the shadowed side of every street.",
        "motion": "You walk the length of the town over the whole song while the sun crosses the sky, so every shadow swings from one side of the streets to the other. The view drifts with the two of you, and the red never quite catches up and never drops back.",
        "red": "The one following you.",
        "stills": [
          {
            "time": 42,
            "line": "And pulled the clouds into the sea to clear the sky of smoke, you know",
            "src": "/video-styles/ideas/conman/shadows-1.svg"
          },
          {
            "time": 124,
            "line": "No matter where I go, I never seem to change",
            "src": "/video-styles/ideas/conman/shadows-2.svg"
          },
          {
            "time": 175,
            "line": "Watch me split the ground and pierce the sky and find a groove",
            "src": "/video-styles/ideas/conman/shadows-3.svg"
          },
          {
            "time": 222,
            "line": "No matter what I do, I always sound the same",
            "src": "/video-styles/ideas/conman/shadows-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "goodbye-norma-jeane",
    "track": 3,
    "title": "Goodbye, Norma Jeane",
    "core": "The price of fame",
    "concepts": [
      {
        "id": "edition",
        "name": "The Edition",
        "lyric": "Know you want the world, it's more, more, more",
        "idea": "One silhouette, curls and lips, pulled through a pink screen once for every word she sings. The first print is perfect; by the end there are hundreds, each thinner in the black and further off register, and you can no longer find the first one.",
        "motion": "A new pull lands on each measured word, the grid grows outward from the centre, and the camera falls back to keep all of it in frame. The choruses fill the screen fastest, and the outro keeps printing on the beat after the voice has gone.",
        "red": "The squeegee: a red bar that sweeps across each new print as it is pulled.",
        "stills": [
          {
            "time": 24.5,
            "line": "Something bigger's meant for me",
            "src": "/video-styles/ideas/goodbye-norma-jeane/edition-1.svg"
          },
          {
            "time": 84.8,
            "line": "Try to land DiMaggio",
            "src": "/video-styles/ideas/goodbye-norma-jeane/edition-2.svg"
          },
          {
            "time": 150.5,
            "line": "Diamonds are your only friend",
            "src": "/video-styles/ideas/goodbye-norma-jeane/edition-3.svg"
          },
          {
            "time": 230,
            "line": "Know you want the world, it's more, more, more",
            "src": "/video-styles/ideas/goodbye-norma-jeane/edition-4.svg"
          }
        ]
      },
      {
        "id": "marquee",
        "name": "The Marquee",
        "lyric": "Die your hair and change your clothes",
        "idea": "A cinema marquee in black and pink that reads NORMA JEANE. Across the second verse the letters come down one word at a time and new ones go up, and by \"Goodbye, Norma Jean\" it says MARILYN MONROE. Then the bulbs start to burn out.",
        "motion": "The bulbs chase on the half-beat and blaze together in the choruses. Each swapped letter drops on its word. From the third verse a bulb dies on every word, until the last chorus plays to a dark sign with only her new name on it.",
        "red": "Each old letter turns red as it falls out of the sign.",
        "stills": [
          {
            "time": 22,
            "line": "Silver screen says Norma Jeane, oh",
            "src": "/video-styles/ideas/goodbye-norma-jeane/marquee-1.svg"
          },
          {
            "time": 75.5,
            "line": "Bat your eyelids really slow",
            "src": "/video-styles/ideas/goodbye-norma-jeane/marquee-2.svg"
          },
          {
            "time": 103,
            "line": "Goodbye, Norma Jean. You meant the world to me",
            "src": "/video-styles/ideas/goodbye-norma-jeane/marquee-3.svg"
          },
          {
            "time": 236,
            "line": "I wanted you, you wanted more",
            "src": "/video-styles/ideas/goodbye-norma-jeane/marquee-4.svg"
          }
        ]
      },
      {
        "id": "carpet",
        "name": "The Red Carpet",
        "lyric": "Silver screen says Norma Jeane, oh",
        "idea": "A red carpet running into black, roped off in pink, walked at the pace of the song. Every word sets off a flashbulb along the ropes. Nobody is on it: you are the one walking.",
        "motion": "The camera walks forward all song, without a cut. One flash per word in the verses and three per word in the choruses, so the choruses become a wall of white. In the outro the carpet runs out ahead and the dark comes up to meet it.",
        "red": "The carpet: the one road through the frame, and the only red.",
        "stills": [
          {
            "time": 22,
            "line": "Silver screen says Norma Jeane, oh",
            "src": "/video-styles/ideas/goodbye-norma-jeane/carpet-1.svg"
          },
          {
            "time": 104,
            "line": "Goodbye, Norma Jean. You meant the world to me",
            "src": "/video-styles/ideas/goodbye-norma-jeane/carpet-2.svg"
          },
          {
            "time": 160.8,
            "line": "At least these pills should help you cope",
            "src": "/video-styles/ideas/goodbye-norma-jeane/carpet-3.svg"
          },
          {
            "time": 270,
            "line": "",
            "src": "/video-styles/ideas/goodbye-norma-jeane/carpet-4.svg"
          }
        ]
      },
      {
        "id": "receipts",
        "name": "Gross Receipts",
        "lyric": "I wanted you, you wanted more",
        "idea": "A box-office chart on pink graph paper, in log scale. The red line climbs from $1 into the billions, one step for every word. A dotted line marked \"you\", where she began, sinks out of the bottom of the frame and never comes back.",
        "motion": "The camera rides the head of the line like Andalusia's route, smoothed over two seconds so it never jolts. Notes are pencilled where the song names things: DiMaggio, Diamonds, Goodbye. After the last word the line keeps going up.",
        "red": "The receipts line and its head.",
        "stills": [
          {
            "time": 36,
            "line": "Someone else could cut your checks",
            "src": "/video-styles/ideas/goodbye-norma-jeane/receipts-1.svg"
          },
          {
            "time": 85.2,
            "line": "Try to land DiMaggio",
            "src": "/video-styles/ideas/goodbye-norma-jeane/receipts-2.svg"
          },
          {
            "time": 151.3,
            "line": "Diamonds are your only friend",
            "src": "/video-styles/ideas/goodbye-norma-jeane/receipts-3.svg"
          },
          {
            "time": 236.5,
            "line": "I wanted you, you wanted more",
            "src": "/video-styles/ideas/goodbye-norma-jeane/receipts-4.svg"
          }
        ]
      },
      {
        "id": "diamond",
        "name": "Only Friend",
        "lyric": "Diamonds are your only friend",
        "idea": "One brilliant-cut diamond, engraved in line, turning slowly in the middle of the paper. Its facets catch pink and hatched black as they turn to the light. Hard, beautiful and cold: the friend who stays.",
        "motion": "It turns at one steady speed for the whole song and grows from a jewel to the whole frame by the last chorus. The rays of light behind it multiply as the song goes on.",
        "red": "A glint that jumps to a new facet on every word, then fades.",
        "stills": [
          {
            "time": 31.5,
            "line": "With a silhouette like Juliet, oh",
            "src": "/video-styles/ideas/goodbye-norma-jeane/diamond-1.svg"
          },
          {
            "time": 105,
            "line": "Goodbye, Norma Jean. You meant the world to me",
            "src": "/video-styles/ideas/goodbye-norma-jeane/diamond-2.svg"
          },
          {
            "time": 150.6,
            "line": "Diamonds are your only friend",
            "src": "/video-styles/ideas/goodbye-norma-jeane/diamond-3.svg"
          },
          {
            "time": 229,
            "line": "Know you want the world, it's more, more, more",
            "src": "/video-styles/ideas/goodbye-norma-jeane/diamond-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "ivory",
    "track": 4,
    "title": "Ivory",
    "core": "At a loss for words",
    "concepts": [
      {
        "id": "letter",
        "name": "The Unfinished Letter",
        "lyric": "When I asked her for her name, she looked straight back at me, oh",
        "idea": "A letter that opens \"Dear ______,\" and never fills in the blank. Each line he sings is written out in a hand you can't quite read, then crossed out. The only lines left standing at the end are the two that say he'll keep this one for himself.",
        "motion": "The pen writes word by word on the measured onsets, and the camera follows it down the page. On every \"Ivory\" the pen goes back up to the blank and hovers there without writing. In the outro the camera pulls back to show the whole page.",
        "red": "The nib: it writes, it hovers over her name, and it never lands there.",
        "stills": [
          {
            "time": 16,
            "line": "Eyes that hit a sunrise like waves that hit a shore, oh",
            "src": "/video-styles/ideas/ivory/letter-1.svg"
          },
          {
            "time": 41.5,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/letter-2.svg"
          },
          {
            "time": 90,
            "line": "When I asked her for her name, she looked straight back at me, oh",
            "src": "/video-styles/ideas/ivory/letter-3.svg"
          },
          {
            "time": 186,
            "line": "",
            "src": "/video-styles/ideas/ivory/letter-4.svg"
          }
        ]
      },
      {
        "id": "breath",
        "name": "Held Breath",
        "lyric": "But when she asked me for my name, I forgot how to breathe, oh",
        "idea": "A respiration chart: blue grid paper running under a pen that records his breathing. It rises and falls slowly with the song. Every \"Ivory\", the moment she looks back at him, and the moment she asks his name, the line catches and goes flat.",
        "motion": "The paper scrolls at a steady speed under the pen, which breathes eight beats to a breath, deeper in the choruses. Each catch is a small gasp and then a held flat line, pencilled with what caused it. The longest hold runs from \"breathe\" to the next \"Ivory\".",
        "red": "The breath itself: the trace and the pen tip.",
        "stills": [
          {
            "time": 42.5,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/breath-1.svg"
          },
          {
            "time": 90.8,
            "line": "When I asked her for her name, she looked straight back at me, oh",
            "src": "/video-styles/ideas/ivory/breath-2.svg"
          },
          {
            "time": 139.5,
            "line": "But when she asked me for my name, I forgot how to breathe, oh",
            "src": "/video-styles/ideas/ivory/breath-3.svg"
          },
          {
            "time": 166,
            "line": "Oh, Ivory",
            "src": "/video-styles/ideas/ivory/breath-4.svg"
          }
        ]
      },
      {
        "id": "blanks",
        "name": "Five Blanks",
        "lyric": "I want to get to know her, she remains my mystery",
        "idea": "Five blank slots where her name should go. Every word he sings is a letter he tries in one of them, in blue, and rubs out again, so the slots fill with smudged attempts. Only when the song says \"Ivory\" does the name appear in black. Then it fades back to blanks.",
        "motion": "One attempt per word, cycling through the five slots, building up like pencil on a page worked too hard. Each \"Ivory\" writes the name letter by letter, holds it for a breath and lets it go. The last \"Ivory\" stays.",
        "red": "The cursor under the slot being tried, sliding to the next on every word.",
        "stills": [
          {
            "time": 29,
            "line": "Her eyes are open ocean and blue butterfly wings",
            "src": "/video-styles/ideas/ivory/blanks-1.svg"
          },
          {
            "time": 41.5,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/blanks-2.svg"
          },
          {
            "time": 133.5,
            "line": "But when she asked me for my name, I forgot how to breathe, oh",
            "src": "/video-styles/ideas/ivory/blanks-3.svg"
          },
          {
            "time": 176,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/blanks-4.svg"
          }
        ]
      },
      {
        "id": "butterfly",
        "name": "Blue Butterfly",
        "lyric": "Her eyes are open ocean and blue butterfly wings",
        "idea": "One blue butterfly crossing a meadow drawn in a few engraved strokes, with its flight path dotted in red behind it like Andalusia's route. It loops and doubles back and never flies straight: she remains a mystery.",
        "motion": "The camera follows it smoothly at the pace of the record, its wings beating on the beat. On each \"Ivory\" it settles on a flower and slowly opens its wings, then lifts off again. At the end the camera pulls back to show the whole looping flight, and the butterfly is gone.",
        "red": "The flight path: a dotted line that only ever grows.",
        "stills": [
          {
            "time": 30,
            "line": "Her eyes are open ocean and blue butterfly wings",
            "src": "/video-styles/ideas/ivory/butterfly-1.svg"
          },
          {
            "time": 96,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/butterfly-2.svg"
          },
          {
            "time": 133,
            "line": "But when she asked me for my name, I forgot how to breathe, oh",
            "src": "/video-styles/ideas/ivory/butterfly-3.svg"
          },
          {
            "time": 186,
            "line": "",
            "src": "/video-styles/ideas/ivory/butterfly-4.svg"
          }
        ]
      },
      {
        "id": "sand",
        "name": "Name in the Sand",
        "lyric": "Eyes that hit a sunrise like waves that hit a shore, oh",
        "idea": "A shore engraved in level lines: sky, blue sea, stippled sand. Her name is scratched in the sand, and every line he sings sends a wave up the beach that takes some of it back. He never finishes saying it before the sea has it.",
        "motion": "Each sung line is a wave: it runs up, washes the top off the letters, and slides back. On every \"Ivory\" the name is written in again, left to right. A red sun rises out of the sea over the whole song.",
        "red": "The sun, coming up from the horizon across the song.",
        "stills": [
          {
            "time": 16,
            "line": "Eyes that hit a sunrise like waves that hit a shore, oh",
            "src": "/video-styles/ideas/ivory/sand-1.svg"
          },
          {
            "time": 42.5,
            "line": "Ivory",
            "src": "/video-styles/ideas/ivory/sand-2.svg"
          },
          {
            "time": 90,
            "line": "When I asked her for her name, she looked straight back at me, oh",
            "src": "/video-styles/ideas/ivory/sand-3.svg"
          },
          {
            "time": 166,
            "line": "Oh, Ivory",
            "src": "/video-styles/ideas/ivory/sand-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "new-york",
    "track": 6,
    "title": "New York",
    "core": "Rebellion",
    "concepts": [
      {
        "id": "lights-on-the-shore",
        "name": "The Lights on the Shore",
        "lyric": "I don't wanna follow those lights I see out on the shore",
        "idea": "A night sea engraved in black lines, with the shore along the horizon and its lights coming on one by one in poster yellow. Under us a boat is heading out to sea, and its wake runs back to the shore in red.",
        "motion": "We pull away from the land for the whole song, so the shore and its lights shrink towards the horizon. Every line lights more of them, and they flare on every \"lights\". Every refusal throws the boat into a hard turn that stays in the wake. By the held \"York\" the shore is a thin yellow thread.",
        "red": "The wake: every turn he made away from the shore.",
        "stills": [
          {
            "time": 42,
            "line": "I don't wanna follow those lights I see out on the shore",
            "src": "/video-styles/ideas/new-york/lights-on-the-shore-1.svg"
          },
          {
            "time": 99,
            "line": "I don't wanna listen to anybody ever anymore",
            "src": "/video-styles/ideas/new-york/lights-on-the-shore-2.svg"
          },
          {
            "time": 160,
            "line": "I don't wanna follow those lights I see out on the shore",
            "src": "/video-styles/ideas/new-york/lights-on-the-shore-3.svg"
          },
          {
            "time": 194,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/lights-on-the-shore-4.svg"
          }
        ]
      },
      {
        "id": "against-the-grain",
        "name": "Against the Grain",
        "lyric": "I don't wanna listen to anybody ever anymore",
        "idea": "A field of hundreds of small ink arrows, all pointing towards a yellow light on the right edge of the frame. One red arrow points the other way and pushes slowly through them.",
        "motion": "The field sways on the beat. Every measured \"No\", \"don't\", \"won't\" and \"not\" sends a ring out from the red arrow, and the arrows it reaches turn round and go dark with him. Across the song the turned ground spreads behind him and the light fades.",
        "red": "The one arrow pointing the other way, and the ring of each refusal.",
        "stills": [
          {
            "time": 45,
            "line": "I don't wanna follow those lights I see out on the shore",
            "src": "/video-styles/ideas/new-york/against-the-grain-1.svg"
          },
          {
            "time": 103,
            "line": "I don't wanna listen to anybody ever anymore",
            "src": "/video-styles/ideas/new-york/against-the-grain-2.svg"
          },
          {
            "time": 115,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/against-the-grain-3.svg"
          },
          {
            "time": 194,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/against-the-grain-4.svg"
          }
        ]
      },
      {
        "id": "signpost",
        "name": "The Signpost",
        "lyric": "They said move to Memphis, Nashville, Austin, L.A., or Detroit",
        "idea": "A fingerpost at a crossroads. New York is the top board, in poster yellow, and every city they told him to move to is nailed up under it as it is sung. His own board is on the other side of the post: red, blank, pointing the other way.",
        "motion": "Boards go up on their words in verse 2. Every refusal knocks one loose to swing and hang off its nail, and New York shudders on each. His board is painted a stroke per refusal. On the first \"York\" New York swings loose, and as the voice lets go of the held \"York\" it drops into the grass.",
        "red": "His board, the only one with no name on it.",
        "stills": [
          {
            "time": 72.5,
            "line": "They said move to Memphis, Nashville, Austin, L.A, or Detroit",
            "src": "/video-styles/ideas/new-york/signpost-1.svg"
          },
          {
            "time": 99,
            "line": "I don't wanna listen to anybody ever anymore",
            "src": "/video-styles/ideas/new-york/signpost-2.svg"
          },
          {
            "time": 119,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/signpost-3.svg"
          },
          {
            "time": 206.64,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/signpost-4.svg"
          }
        ]
      },
      {
        "id": "out-of-time",
        "name": "Out of Time",
        "lyric": "I don't wanna listen to anybody ever anymore",
        "idea": "Seven engraved metronomes in a row, all ticking at the record's own 98.5. The one in the middle has a red arm.",
        "motion": "All seven keep the click together until the first \"don't\". From there the red one drifts onto its own slower tempo, and its readout drops below 98.5. In the \"No, no, no, no\" sections it swings hard against the other six. On the held \"York\" it stops dead and stands upright while the rest tick on.",
        "red": "The metronome that will not keep time.",
        "stills": [
          {
            "time": 30,
            "line": "That easy dreams like submarines can undermine mankind's familiar goal",
            "src": "/video-styles/ideas/new-york/out-of-time-1.svg"
          },
          {
            "time": 92,
            "line": "I don't wanna follow those lights I see out on the shore",
            "src": "/video-styles/ideas/new-york/out-of-time-2.svg"
          },
          {
            "time": 110.3,
            "line": "No, no, no, no",
            "src": "/video-styles/ideas/new-york/out-of-time-3.svg"
          },
          {
            "time": 200,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/out-of-time-4.svg"
          }
        ]
      },
      {
        "id": "chain",
        "name": "The Chain",
        "lyric": "No, I won't go, I'm not going to New York",
        "idea": "A chain across the plate, from an iron ring in the wall to a winch marked New York that is winding it in. The link in the middle is red.",
        "motion": "The winch takes up slack all song, so the chain rises from a deep sag to a straight bar. Every \"No\" jerks it and pulls the red link a little further open. On 3:26, as the voice finally lets go of \"York\", the red link parts: one half drops from the wall, the other is reeled away.",
        "red": "The one link that will not hold.",
        "stills": [
          {
            "time": 42,
            "line": "I don't wanna follow those lights I see out on the shore",
            "src": "/video-styles/ideas/new-york/chain-1.svg"
          },
          {
            "time": 111,
            "line": "No, no, no, no",
            "src": "/video-styles/ideas/new-york/chain-2.svg"
          },
          {
            "time": 190,
            "line": "No, no, no, no",
            "src": "/video-styles/ideas/new-york/chain-3.svg"
          },
          {
            "time": 206.64,
            "line": "No, I won't go, I'm not going to New York",
            "src": "/video-styles/ideas/new-york/chain-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "meet-me-at-the-horizon",
    "track": 7,
    "title": "Meet Me at the Horizon",
    "core": "Sleepless nights",
    "concepts": [
      {
        "id": "sleep-study",
        "name": "The Sleep Study",
        "lyric": "When the absence of light doesn't mean that I sleep",
        "idea": "One night on a polysomnogram: the stages of sleep as rows, the hours of the night across the sheet. The red pen is scored awake on every sung line and only starts to go under in the gaps between them.",
        "motion": "The trace writes left to right across the whole song, stepping on the measured words. The light channel above it turns gold in each chorus, then back to black. In the outro, the first long gap of the night, the trace finally drops to deep sleep as the morning comes.",
        "red": "The pen and its trace, the only thing moving across the chart.",
        "stills": [
          {
            "time": 31,
            "line": "When the absence of light doesn't mean that I sleep",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/sleep-study-1.svg"
          },
          {
            "time": 82.5,
            "line": "Unnatural tension in my brain and my eyes",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/sleep-study-2.svg"
          },
          {
            "time": 129.2,
            "line": "Meet me at the horizon",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/sleep-study-3.svg"
          },
          {
            "time": 189.6,
            "line": "Meet me at the horizon, oh",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/sleep-study-4.svg"
          }
        ]
      },
      {
        "id": "star-trails",
        "name": "Star Trails",
        "lyric": "I lie in my bed and I think of the sky",
        "idea": "A long exposure of the night sky over a black hill. The stars turn round the pole and draw their arcs as the song goes, so the length of every trail is how long he has been lying awake.",
        "motion": "All the arcs lengthen together, smoothly, from the first line to the last. Gold dawn lines rise behind the ridge in each chorus and sink back. In the outro they climb and the stars fade into them.",
        "red": "One star whose trail falls through the night and touches the horizon on the last \"meet me at the horizon\".",
        "stills": [
          {
            "time": 40,
            "line": "And I wonder what happens right after we die",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/star-trails-1.svg"
          },
          {
            "time": 99,
            "line": "The windows are open to let in the wind",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/star-trails-2.svg"
          },
          {
            "time": 160.5,
            "line": "And the sun starts to wake and the trees start to yawn",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/star-trails-3.svg"
          },
          {
            "time": 189.6,
            "line": "Meet me at the horizon, oh",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/star-trails-4.svg"
          }
        ]
      },
      {
        "id": "counting",
        "name": "No Counting Sheep",
        "lyric": "Just me and my thoughts, no counting sheep",
        "idea": "The night counted the way days are scratched on a cell wall: one stroke for every sung word, in fives, filling the plate row by row. It is the most literal picture of a night that will not end.",
        "motion": "Each stroke is drawn on its word’s measured onset in about 90 ms, so the wall fills in time with the singing and stops in the gaps. A window of gold light crosses the wall in each chorus and settles on it in the outro.",
        "red": "The newest stroke, always the one just sung.",
        "stills": [
          {
            "time": 28,
            "line": "Just me and my thoughts, no counting sheep",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/counting-1.svg"
          },
          {
            "time": 96,
            "line": "And the room breaks the silence when the house starts to creak",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/counting-2.svg"
          },
          {
            "time": 154,
            "line": "Just me and my thoughts in that bed all alone",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/counting-3.svg"
          },
          {
            "time": 189.6,
            "line": "Meet me at the horizon, oh",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/counting-4.svg"
          }
        ]
      },
      {
        "id": "ceiling",
        "name": "The Ceiling",
        "lyric": "And the room breaks the silence when the house starts to creak",
        "idea": "The view from the pillow: the ceiling, its rose, the walls falling away at the edges. Moonlight through the window sits on the ceiling as a pale shape, and a hairline crack spreads out from the cornice.",
        "motion": "The window’s light slides slowly across the ceiling for the whole night and turns gold and wide in the dawns. The crack grows a little on every sung word, so it spreads with the worry and pauses when he does.",
        "red": "The crack, worrying its way across the ceiling.",
        "stills": [
          {
            "time": 36.5,
            "line": "I lie in my bed and I think of the sky",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/ceiling-1.svg"
          },
          {
            "time": 85.5,
            "line": "And the headache evolves when I straighten my spine",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/ceiling-2.svg"
          },
          {
            "time": 112.5,
            "line": "And the dark of the night meets a glimpse of the dawn",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/ceiling-3.svg"
          },
          {
            "time": 175,
            "line": "And I lie here and miss the way things used to be, so",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/ceiling-4.svg"
          }
        ]
      },
      {
        "id": "two-lights",
        "name": "Two Lights",
        "lyric": "Meet me at the horizon",
        "idea": "One horizon line over a dark engraved sea, with two lights on it: his in red from the left and yours in gold from the right. The whole video is whether they meet.",
        "motion": "The lights close through the verses and nearly touch on the first \"meet me at the horizon\". They drift apart again while he misses the way things used to be, then meet on the last one. The water trembles on every word and the night lines thin as the dawn comes.",
        "red": "His light, travelling the horizon towards hers.",
        "stills": [
          {
            "time": 30.5,
            "line": "When the absence of light doesn't mean that I sleep",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/two-lights-1.svg"
          },
          {
            "time": 100,
            "line": "The windows are open to let in the wind",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/two-lights-2.svg"
          },
          {
            "time": 128.5,
            "line": "Meet me at the horizon",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/two-lights-3.svg"
          },
          {
            "time": 190.5,
            "line": "Meet me at the horizon, oh",
            "src": "/video-styles/ideas/meet-me-at-the-horizon/two-lights-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "rocks-in-the-sea",
    "track": 8,
    "title": "Rocks in the Sea",
    "core": "Being called, and choosing to stay",
    "concepts": [
      {
        "id": "cairn",
        "name": "The Cairn",
        "lyric": "I stranded those rocks by the bay",
        "idea": "A beach with the rocks out in the sea and a small cairn on the sand. One red stone sits at the water’s edge. The tide is the pull, and the cairn is the people he stays for.",
        "motion": "The tide creeps up the sand through verse 2 and the first chorus and washes over the red stone’s foot. When the rocks \"call my name\", rings spread across the water from them. In verse 3 a stone is set on the cairn for each line: his sister, the things they make, the rocks by the bay. On \"I choose to stay\" the red stone is lifted onto the top. Then the tide goes out and the rain stops.",
        "red": "One stone: at the water’s edge for most of the song, and at the top of the cairn at the end.",
        "stills": [
          {
            "time": 45.5,
            "line": "It's always with me, what a shame",
            "src": "/video-styles/ideas/rocks-in-the-sea/cairn-1.svg"
          },
          {
            "time": 97,
            "line": "And the rocks in the water have been calling my name",
            "src": "/video-styles/ideas/rocks-in-the-sea/cairn-2.svg"
          },
          {
            "time": 168,
            "line": "I stranded those rocks by the bay",
            "src": "/video-styles/ideas/rocks-in-the-sea/cairn-3.svg"
          },
          {
            "time": 200,
            "line": "And the only place that's calling your name",
            "src": "/video-styles/ideas/rocks-in-the-sea/cairn-4.svg"
          }
        ]
      },
      {
        "id": "tide-table",
        "name": "Tide Table",
        "lyric": "And the rocks in the water have been calling my name",
        "idea": "A printed tide chart for the bay: heights in metres, the hours across the bottom, the high-water mark as a dashed line. The red curve is the pull, drawn as a tide.",
        "motion": "The curve writes itself across the chart for the whole song, with the water under it hatched in blue. Each tide is higher than the last, and the highest goes over the high-water line on \"the sand by the rocks in the sea\". It turns on \"I choose to stay\" and falls to the lowest water of the day as the song ends. HW and LW are pencilled in at each turn as it passes.",
        "red": "The tide line and the pen drawing it.",
        "stills": [
          {
            "time": 52,
            "line": "It's always with me, much to my shame",
            "src": "/video-styles/ideas/rocks-in-the-sea/tide-table-1.svg"
          },
          {
            "time": 98,
            "line": "And the rocks in the water have been calling my name",
            "src": "/video-styles/ideas/rocks-in-the-sea/tide-table-2.svg"
          },
          {
            "time": 126,
            "line": "Is the sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/tide-table-3.svg"
          },
          {
            "time": 206,
            "line": "Is the sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/tide-table-4.svg"
          }
        ]
      },
      {
        "id": "windscreen",
        "name": "Windscreen",
        "lyric": "I can't seem to shake all this rain",
        "idea": "The view through a rainy windscreen down a road between trees. Rain gathers on the glass, the wiper clears it on every line, and the rain comes back. Far down the road is one small red light.",
        "motion": "The road narrows and the trees close in as the pull builds (\"the road slims down\"). Lane dashes stream toward you the whole time. The wiper sweeps on each sung line. After \"I choose to stay\" no more rain forms, and the red light grows into the lit window of a house at the end of the road.",
        "red": "The light of home at the end of the road.",
        "stills": [
          {
            "time": 31,
            "line": "I drove by my hometown today",
            "src": "/video-styles/ideas/rocks-in-the-sea/windscreen-1.svg"
          },
          {
            "time": 90.5,
            "line": "I can't seem to shake all this rain",
            "src": "/video-styles/ideas/rocks-in-the-sea/windscreen-2.svg"
          },
          {
            "time": 120,
            "line": "And the only place that's calling your name",
            "src": "/video-styles/ideas/rocks-in-the-sea/windscreen-3.svg"
          },
          {
            "time": 205,
            "line": "Is the sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/windscreen-4.svg"
          }
        ]
      },
      {
        "id": "road-home",
        "name": "The Road Home",
        "lyric": "When the road slims down and the trees hide the sound",
        "idea": "A map in Andalusia’s manner: a hometown, a road out through the woods, the coast, and the rocks offshore. The road is a double line, then a single line, then a dashed track, so it slims down on the paper as it gets to the sea.",
        "motion": "A red route drives out of town and into the trees through the verses, and reaches the coast in the first chorus. It waits there through the break. On \"I choose to stay\" it turns, and it runs the whole road back home alongside its own track, arriving as the song ends.",
        "red": "The route: out to the coast, and the hairpin back.",
        "stills": [
          {
            "time": 45.5,
            "line": "It's always with me, what a shame",
            "src": "/video-styles/ideas/rocks-in-the-sea/road-home-1.svg"
          },
          {
            "time": 104,
            "line": "When the road slims down and the trees hide the sound",
            "src": "/video-styles/ideas/rocks-in-the-sea/road-home-2.svg"
          },
          {
            "time": 165,
            "line": "About nothing at all and the things that we make",
            "src": "/video-styles/ideas/rocks-in-the-sea/road-home-3.svg"
          },
          {
            "time": 218,
            "line": "Oh, the sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/road-home-4.svg"
          }
        ]
      },
      {
        "id": "undertow",
        "name": "Undertow",
        "lyric": "I'll leave all my things and just drift away",
        "idea": "A cyanotype current chart: the bay in solid blue, the current as running white lines, the rocks in black at the right and the sand at the left. One red float is carried on the water.",
        "motion": "The current lines run, and they strengthen and bend toward the rocks as the pull builds. The float drifts out with them and its dotted track trails behind it. On \"I choose to stay\" the whole field turns and runs toward the shore, and the float comes back and rests against the sand.",
        "red": "The float, and the dotted line of where it has drifted.",
        "stills": [
          {
            "time": 52,
            "line": "It's always with me, much to my shame",
            "src": "/video-styles/ideas/rocks-in-the-sea/undertow-1.svg"
          },
          {
            "time": 98,
            "line": "And the rocks in the water have been calling my name",
            "src": "/video-styles/ideas/rocks-in-the-sea/undertow-2.svg"
          },
          {
            "time": 128,
            "line": "Is the sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/undertow-3.svg"
          },
          {
            "time": 214,
            "line": "The sand by the rocks in the sea",
            "src": "/video-styles/ideas/rocks-in-the-sea/undertow-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "ship-to-stockholm",
    "track": 9,
    "title": "Ship to Stockholm",
    "core": "Moving on",
    "concepts": [
      {
        "id": "astern",
        "name": "Looking Astern",
        "lyric": "Oh, away with the land and away with the light",
        "idea": "The view off the back of the ship for the whole song: the coast and its lighthouse getting smaller on the horizon, the wake running back to it. Moving on, seen from the only place you can watch it happen.",
        "motion": "The water streams away to the horizon at a steady speed and swells on the words. The land shrinks all song, the lighthouse beam weakens, and in the outro the coast slips under the horizon and is gone.",
        "red": "The wake’s centre line: the way already come, a red thread from the stern back to the land.",
        "stills": [
          {
            "time": 31.5,
            "line": "Oh, away with the land and away with the light",
            "src": "/video-styles/ideas/ship-to-stockholm/astern-1.svg"
          },
          {
            "time": 74,
            "line": "Oh, to get back to you I'd do all that I can",
            "src": "/video-styles/ideas/ship-to-stockholm/astern-2.svg"
          },
          {
            "time": 188,
            "line": "We're walking a tightrope to Eden",
            "src": "/video-styles/ideas/ship-to-stockholm/astern-3.svg"
          },
          {
            "time": 223.5,
            "line": "So I'm taking the ship back to Stockholm",
            "src": "/video-styles/ideas/ship-to-stockholm/astern-4.svg"
          }
        ]
      },
      {
        "id": "board",
        "name": "The Departure Board",
        "lyric": "The ship back to Stockholm, it waits on no man",
        "idea": "A split-flap board at the quay. Every ship on it leaves on time, verse by verse, and the board rolls up. Stockholm is the last row.",
        "motion": "The clock keeps running. At each section’s end a row flips to DEPARTED and the board glides up a line. On the last line Stockholm flips to FINAL CALL, then DEPARTED on the word “Stockholm”, and the board is left empty.",
        "red": "Stockholm’s row, climbing the board as the ships ahead of it go.",
        "stills": [
          {
            "time": 40,
            "line": "Tomorrow I will be a' sailing",
            "src": "/video-styles/ideas/ship-to-stockholm/board-1.svg"
          },
          {
            "time": 114,
            "line": "So away with your guns and away with the fight",
            "src": "/video-styles/ideas/ship-to-stockholm/board-2.svg"
          },
          {
            "time": 210,
            "line": "And I don't need to kiss you, no I just need to ask",
            "src": "/video-styles/ideas/ship-to-stockholm/board-3.svg"
          },
          {
            "time": 225.2,
            "line": "So I'm taking the ship back to Stockholm",
            "src": "/video-styles/ideas/ship-to-stockholm/board-4.svg"
          }
        ]
      },
      {
        "id": "ice",
        "name": "The Lead Through the Ice",
        "lyric": "It’s deep water rescue on razor thin ice",
        "idea": "Pack ice from directly above. A lead of open water cracks through it, corner to corner, and the floes shoulder apart to let the ship by.",
        "motion": "The crack advances with the words sung and keeps creeping through the instrumentals. Floes near the head jolt on each word and drift wider the longer the lead has been open. By the last line the lead has crossed the whole plate.",
        "red": "The ship’s track up the lead, with the bow as a dot at its head.",
        "stills": [
          {
            "time": 33,
            "line": "Oh, away with the land and away with the light",
            "src": "/video-styles/ideas/ship-to-stockholm/ice-1.svg"
          },
          {
            "time": 83,
            "line": "Bribing or begging or bleeding, oh",
            "src": "/video-styles/ideas/ship-to-stockholm/ice-2.svg"
          },
          {
            "time": 135,
            "line": "Everyone's beyond persuading, oh",
            "src": "/video-styles/ideas/ship-to-stockholm/ice-3.svg"
          },
          {
            "time": 224,
            "line": "So I'm taking the ship back to Stockholm",
            "src": "/video-styles/ideas/ship-to-stockholm/ice-4.svg"
          }
        ]
      },
      {
        "id": "telegraph",
        "name": "Telegraph Tape",
        "lyric": "I can’t seem to reach you, not by letter or phone",
        "idea": "A Morse register printing the lyric as it is sung, word by word, onto paper tape, with the operator’s pencilled letters underneath. Message after message goes out and none of it is answered.",
        "motion": "The tape advances only when a word is sung, so the spacing on it is the rhythm of the voice, and the instrumentals leave long blank runs. The spool of blank tape thins over the song. It ends on S-T-O-C-K-H-O-L-M.",
        "red": "The word being sent now. Once it has been sent it turns to ink.",
        "stills": [
          {
            "time": 33.5,
            "line": "Oh, away with the land and away with the light",
            "src": "/video-styles/ideas/ship-to-stockholm/telegraph-1.svg"
          },
          {
            "time": 61.5,
            "line": "The ship back to Stockholm, it waits on no man",
            "src": "/video-styles/ideas/ship-to-stockholm/telegraph-2.svg"
          },
          {
            "time": 113.5,
            "line": "So away with your guns and away with the fight",
            "src": "/video-styles/ideas/ship-to-stockholm/telegraph-3.svg"
          },
          {
            "time": 225.8,
            "line": "So I'm taking the ship back to Stockholm",
            "src": "/video-styles/ideas/ship-to-stockholm/telegraph-4.svg"
          }
        ]
      },
      {
        "id": "tightrope",
        "name": "A Tightrope to Eden",
        "lyric": "We’re walking a tightrope to Eden",
        "idea": "One rope from a mast to a rock with a single tree on it, strung above deep water. A red bead makes the crossing over the whole song.",
        "motion": "The bead moves with the words and the clock and never stops. Its weight bends the rope, and every sung syllable sends a ripple down the line. It reaches the tree on the last line.",
        "red": "The bead: the one crossing, left to right.",
        "stills": [
          {
            "time": 31,
            "line": "Oh, away with the land and away with the light",
            "src": "/video-styles/ideas/ship-to-stockholm/tightrope-1.svg"
          },
          {
            "time": 116,
            "line": "So away with your guns and away with the fight",
            "src": "/video-styles/ideas/ship-to-stockholm/tightrope-2.svg"
          },
          {
            "time": 188,
            "line": "We're walking a tightrope to Eden",
            "src": "/video-styles/ideas/ship-to-stockholm/tightrope-3.svg"
          },
          {
            "time": 224,
            "line": "So I'm taking the ship back to Stockholm",
            "src": "/video-styles/ideas/ship-to-stockholm/tightrope-4.svg"
          }
        ]
      }
    ]
  },
  {
    "slug": "ghost",
    "track": 10,
    "title": "Ghost",
    "core": "Helplessness",
    "concepts": [
      {
        "id": "city",
        "name": "The City Through Glass",
        "lyric": "The city burns and I’m a ghost",
        "idea": "A window, and through it a skyline catching fire one roof at a time. The whole film is on the other side of the glass.",
        "motion": "Each “burns” and “fire” in the lyric lights another roof, and flames jump on the words. Smoke hatches the sky more thickly each block. On “I’d hold you close” a grey handprint appears on the pane and stays there.",
        "red": "The fires. Nothing else in the room is red.",
        "stills": [
          {
            "time": 40,
            "line": "The city burns and I'm a ghost",
            "src": "/video-styles/ideas/ghost/city-1.svg"
          },
          {
            "time": 101,
            "line": "I'd hold you close, I'm not allowed",
            "src": "/video-styles/ideas/ghost/city-2.svg"
          },
          {
            "time": 131,
            "line": "But you're on fire and I'm a ghost",
            "src": "/video-styles/ideas/ghost/city-3.svg"
          },
          {
            "time": 184,
            "line": "You're on fire. I'm a ghost",
            "src": "/video-styles/ideas/ghost/city-4.svg"
          }
        ]
      },
      {
        "id": "meter",
        "name": "Amplifier Meter",
        "lyric": "Amplifiers just make a noise",
        "idea": "The VU meter of an amplifier, filling the frame. The needle is the voice. It throws itself at the end of the scale and the scale doesn’t care.",
        "motion": "The needle kicks on every sung word with real meter ballistics and falls back. On “fire” it pins hard in the hatched zone. Ghosts of where it just was trail behind it in grey.",
        "red": "The needle.",
        "stills": [
          {
            "time": 22,
            "line": "Amplifiers just make a noise",
            "src": "/video-styles/ideas/ghost/meter-1.svg"
          },
          {
            "time": 83,
            "line": "I wanna help but I can't breathe",
            "src": "/video-styles/ideas/ghost/meter-2.svg"
          },
          {
            "time": 130.45,
            "line": "But you're on fire and I'm a ghost",
            "src": "/video-styles/ideas/ghost/meter-3.svg"
          },
          {
            "time": 183.3,
            "line": "You're on fire. I'm a ghost",
            "src": "/video-styles/ideas/ghost/meter-4.svg"
          }
        ]
      },
      {
        "id": "dance",
        "name": "The Dance Card",
        "lyric": "If I had legs, we could learn to dance",
        "idea": "A printed dance-step diagram. Inked footprints for the lead go round the floor one step per word, and every partner step is a faint grey outline that never fills in.",
        "motion": "A step lands on every sung word, counted one-two-three, round a long oval for the whole song. The oldest steps fade behind, so the dance never ends, and nobody ever dances the other half.",
        "red": "The step being taken now: a dashed arrow from the last print to the new one.",
        "stills": [
          {
            "time": 30,
            "line": "When I write songs, it's not by choice",
            "src": "/video-styles/ideas/ghost/dance-1.svg"
          },
          {
            "time": 92,
            "line": "Can't pick you up, can't put you down",
            "src": "/video-styles/ideas/ghost/dance-2.svg"
          },
          {
            "time": 115.5,
            "line": "If I had legs, we could learn to dance",
            "src": "/video-styles/ideas/ghost/dance-3.svg"
          },
          {
            "time": 165,
            "line": "If I had legs, we could learn to dance",
            "src": "/video-styles/ideas/ghost/dance-4.svg"
          }
        ]
      },
      {
        "id": "manuscript",
        "name": "The Burning Manuscript",
        "lyric": "When I write songs, it’s not by choice",
        "idea": "A page of staff paper. The song writes itself onto it note by note from the top while the page burns up from the bottom.",
        "motion": "Every sung word puts a note on the staff. From the first “burns” the edge climbs: slowly in the first block, past the middle by “I’d play for you if I had hands”, and onto the last notes by the end.",
        "red": "The burning edge, with embers lifting off it.",
        "stills": [
          {
            "time": 31,
            "line": "When I write songs, it's not by choice",
            "src": "/video-styles/ideas/ghost/manuscript-1.svg"
          },
          {
            "time": 92,
            "line": "Can't pick you up, can't put you down",
            "src": "/video-styles/ideas/ghost/manuscript-2.svg"
          },
          {
            "time": 122,
            "line": "I tell you I love you, that I love you the most",
            "src": "/video-styles/ideas/ghost/manuscript-3.svg"
          },
          {
            "time": 183,
            "line": "You're on fire. I'm a ghost",
            "src": "/video-styles/ideas/ghost/manuscript-4.svg"
          }
        ]
      },
      {
        "id": "match",
        "name": "One Match",
        "lyric": "But you’re on fire and I’m a ghost",
        "idea": "One match, struck at the first word, burning down for the whole song. Nothing can be done about it.",
        "motion": "The flame breathes with the voice and creeps down the stick at a steady rate. The burnt wood blackens and curls behind it, engraved rings of light go down with it, and it goes out after the last line, leaving smoke.",
        "red": "The flame and the glowing quick of the wood.",
        "stills": [
          {
            "time": 22,
            "line": "Amplifiers just make a noise",
            "src": "/video-styles/ideas/ghost/match-1.svg"
          },
          {
            "time": 82,
            "line": "I wanna help but I can't breathe",
            "src": "/video-styles/ideas/ghost/match-2.svg"
          },
          {
            "time": 131,
            "line": "But you're on fire and I'm a ghost",
            "src": "/video-styles/ideas/ghost/match-3.svg"
          },
          {
            "time": 187.5,
            "line": "You're on fire. I'm a ghost",
            "src": "/video-styles/ideas/ghost/match-4.svg"
          }
        ]
      }
    ]
  }
]
