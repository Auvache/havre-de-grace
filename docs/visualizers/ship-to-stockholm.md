# Ship to Stockholm — the road trip

Track 9. [/visualizers/ship-to-stockholm](/visualizers/ship-to-stockholm). Film:
`shared/video/films/road-trip.mjs` (`roadTripFrame`, modules in `road-trip/`).
Score: `app/config/shipToStockholmScore.ts`. Built 2026-11-10 in one unattended
run; **not yet seen by the user**.

## What it does

The mark drawn on, the title drawn on, and the black lifts off an old paper
road map of the United States, already drawing slowly back from New York. A red
dot sits in the city through the intro and pulls out as the first line is sung.
It drives to the Turnaround at Seaside, Oregon, by the long way: two-lane roads
through small towns, never the best route, and five wrong turns. The red line of
where it has been stays on the map. The camera tracks it the way Andalusia's
chart tracks the ship: on the average of where the dot has just been and is
about to be, a little more road ahead than behind, never cutting, never still
while the dot moves.

The roads are real. The map is Natural Earth's (roads, water, towns) and the US
Census state lines; the route is OpenStreetMap's road geometry, as a router
drives it between the towns in the itinerary. Roads are printed in the album's
ink by class, as a road map prints them but with no colour of their own, because
red is the dot's: expressways a double line, US routes a single line, state
roads a hairline, with route numbers in their shields. State lines are dashed,
state names set large, pale and letterspaced across their states, water is the
song's ice blue with a deeper band along the coast, and the sheet has the
creases it was folded on.

The line is laid a hair to the right of the road, the side he drives on, so a
road driven out and back is two red lines with the road between them, coming to
a point where he turned round. A wrong turn stays on the map as what it was.

**The wrong turns go to the water.** It is never said, but he is looking for a
ship: four of the five end at a shore, and the trip ends at the ocean on "So I'm
taking the ship back to Stockholm". At each he slows through the fork (where the
right road is in plain sight), stops, sits pulsing on the beat, and goes back.

On the last line he stops at the Pacific. Then one even pull-out, from the dot
to the whole country: the red line wandering from one ocean to the other, wrong
turns and all, held for a bar and a half before the end card.

The "Now" line on the page also shows the kilometres driven (`roadTripStatus`).

## The route

About 6,900 km driven (the direct drive is about 4,700). Every stop is in
`road-trip/itinerary.mjs`; towns marked `via` only steer the router and are not
lettered.

| Stretch | Road |
| --- | --- |
| **New York → Union City, Pa.** | Out through New Jersey and up NJ 23 through **Stockholm, New Jersey** to Port Jervis; then US 6 across the top of Pennsylvania: Honesdale, Tunkhannock, Towanda, Wellsboro, Coudersport, Kane, Warren. |
| **Wrong turn 1 · Lake Erie** | At Union City the road is south-west to Meadville. He goes north 41 km to the bayfront at Erie, where the land runs out, and back. |
| **Union City → Michigan City, Ind.** | Meadville, then Ohio south of Cleveland (Garrettsville, Medina, Norwalk, Fremont, Bowling Green, Napoleon, Bryan) and US 6 across Indiana (Kendallville, Nappanee). |
| **Wrong turn 2 · the boat** | At Michigan City the road is west, round the foot of the lake. He goes 301 km up the shore (St. Joseph, South Haven, Holland, Muskegon) to the car ferry dock at Ludington. The boat sails as he comes up the last of the shore; he sits and watches it go, and drives the whole shore back. |
| **Michigan City → Dubuque** | Valparaiso, round Chicago to the south (Morris, Ottawa), Dixon, Savanna, Galena. |
| **Dubuque → Blunt, S.D.** | Up the Mississippi on the river road (Prairie du Chien, La Crosse, **Stockholm, Wisconsin**), over at Red Wing, across Minnesota (Northfield, St. Peter, New Ulm, Walnut Grove) and Dakota on US 14 (Brookings, De Smet, Huron). |
| **Wrong turn 3 · the Missouri** | At Blunt the road is west through Pierre. He goes north 150 km to Mobridge, where the river is a lake (Lake Oahe), and stops at the water. No way back but on: west on US 12 to Lemmon, south to Faith. |
| **Wrong turn 3½ · Faith** | At Faith the road is west. He goes 36 km back east to Dupree before he catches it, and returns. This and the last are the instrumental: properly lost. |
| **Faith → Burns, Ore.** | Belle Fourche, Devils Tower, Moorcroft, Gillette, the old road through Clearmont to Buffalo, over the Bighorns to Ten Sleep and Worland, Cody, through Yellowstone past the lake and Old Faithful, Ashton, Idaho Falls, Blackfoot, American Falls, Burley, across the Snake River canyon to **Eden, Idaho** (on "We're walking a tightrope to Eden"), Hagerman, Glenns Ferry, Mountain Home, the back road along the Snake (Grand View, Marsing), Vale, Juntura. |
| **Wrong turn 4 · the desert** | At Burns the road is west. He goes 96 km south past Malheur Lake to Frenchglen, the end of the pavement, and back. |
| **Burns → Seaside** | Bend, Madras, Maupin, The Dalles, down the Columbia (Hood River, Portland), US 30 to Clatskanie and Astoria, and down the coast to the Turnaround. |

Where no other road exists the route is on an interstate for a stretch (I-86
west of American Falls, I-84 in the Columbia Gorge and near Glenns Ferry, short
pieces elsewhere); the bake prints every such stretch.

## Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts off the map round New York. |
| 0:28 | New York | The dot waits, pulsing on the beat, and pulls out at 0:29.9 as "Oh, away with the land" starts. |
| 0:50 | **Wrong turn · Lake Erie** | He eases off through Union City (0:51.5) and takes the road north on "To find if lost love is worth saving"; stopped at the lake on "saving" (0:53.7–0:55.3); back at the fork 0:57.2. |
| 0:57 | West on US 6 | Ohio and Indiana through verse 2. |
| 1:15 | **Wrong turn · the boat** | Michigan City at 1:16.9, up the shore; the camera leans out over the lake. The boat leaves the dock at 1:23.2, he arrives at 1:24.9 as "bleeding, oh" ends, and sits until 1:29.4. |
| 1:29 | Round the lake | The break: back down the shore (the line doubled), past Michigan City at 1:37.3, round Chicago, out to the Mississippi. |
| 1:49 | The river road | Dubuque (1:49.3), up the river through Stockholm, Wis. (1:58.0), and west through verse 3. |
| 2:14 | **Wrong turn · the Missouri** | Blunt at 2:15.9, on "Everyone's beyond persuading"; north to Mobridge, stopped at the lake as the instrumental starts (2:20.4–2:22.7). |
| 2:28 | **And again · Faith** | Faith at 2:30.0, the wrong way to Dupree (2:31.6–2:32.9), back through Faith at 2:34.3. |
| 2:40 | Wyoming | Devils Tower, the Bighorns, Cody (2:52.3), Yellowstone (Old Faithful 2:56.5). |
| 3:05 | To Eden | Idaho through verse 4; Eden at 3:07.6, inside "We're walking a tightrope to Eden". |
| 3:18 | **Wrong turn · the desert** | Burns at 3:20.3, south on "The rhetoric's not worth repeating"; stopped at Frenchglen 3:23.2–3:24.5; back through Burns at 3:27.2. |
| 3:27 | The run in | Verse 5, the faster tune: Bend, The Dalles (3:36.8), down the Columbia, Astoria (3:44.0). |
| 3:43 | **Seaside** | Stopped at the ocean at 3:45.3, on "the ship back to Stockholm". |
| 3:48 | **The whole way** | One even pull-out, 3:48.0–4:03.1, to the whole country; the end card on the last strike (4:04.5). |

The poster frame (before play) is 1:33.5: coming back down the lake shore, the
line doubled, the boat away across the water.

## Decided by the user (2026-11-10)

- Said of Rocks in the Sea, then moved: "take what I said about Rocks in the sea
  and apply it to Ship to Stockholm. Leave Rocks in the sea alone for now."
- "I like the road home best, but want to make it a road trip from New York to
  Seaside Oregon. It doesn't have to take the best path, in fact, it should
  largely follow back roads and go down various wrong turns. The dot should
  track similar to andalusia, but follow actual roads in the united states
  (think like the map in conman, but more like an old school paper road map)."
- "take general principles from into the wild and conman and apply them."

Everything else here is Claude's choice and open to the user: the itinerary,
which turns are wrong and where they end, the water idea, the three places the
route passes that the song names (two Stockholms and an Eden, lettered like any
other town and never pointed at), the lettering and the shields, the boat.

## How it is built

- `road-trip/itinerary.mjs` — the only hand-written geography: the stops in
  order, `via` towns that steer the router, `{ back: … }` for a road driven back.
- `node tools/video-styles/roadtrip/bake-route.mjs` — looks each town up
  (OpenStreetMap Nominatim), asks the public OSRM demo router for the road
  between each pair, cuts the in-and-out barb at each town, and writes
  `road-trip/route-baked.mjs` (36 KB). One request a second; every answer is
  cached (`CACHE=<dir>`), so a second run asks nothing. The demo router cannot
  refuse motorways, so the `via` towns do that job; the bake reports how far
  each leg is still on an interstate. Road geometry © OpenStreetMap
  contributors (ODbL). A re-bake with an empty cache can move a road slightly.
- `node tools/video-styles/roadtrip/bake-map.mjs` — bakes Natural Earth 1:10m
  (roads, lakes, rivers, towns), us-atlas state lines and Natural Earth 1:50m
  land into `shared/video/geo/usa.mjs` (536 KB; all public domain). Sources are
  listed at the top of the script.
- `road-trip/geo.mjs` — an Albers conic of the US, in kilometres.
- `road-trip/trip.mjs` — the legs joined into one line, and the clock. The clock
  is driven, not drawn: `PINS` are the stops that must land on the record;
  between two pins the dot holds one pace on the sheet (about 100 px/s, which is
  29 km/s on the ground in the East and 43 in the West, where the camera stands
  further off, `scaleAt`), pulls away over a second, brakes over the last 30 km,
  and eases off through the forks in `SLOW`. Each stretch's pace is solved so it
  arrives exactly on its pin.
- `road-trip/camera.mjs` — the tracking, the lean over the lake, the pull-out.
- `road-trip/map.mjs` — the map as `lib`: the steady layers once, and the roads
  in 300 km tiles mounted the first time the camera comes near them. Names and
  shields are laid out once for the views the film actually takes (`layNames`),
  each clear of the road the dot drives and of its neighbours.
- `node tools/video-styles/roadtrip/check.mjs` — **run after any change to the
  itinerary, clock or camera**: the legs join, each wrong turn comes back to its
  fork, the dot never backs up and meets every pin, the pace by section, the dot
  stays on the plate, every stop has room for its name.

Measured: a frame builds in 0.05 ms under node and is 10–30 KB of markup
(59 KB at the end of the pull-out); the page holds 158 KB of `lib` at first and
522 KB once the whole country has been driven; Chrome held 60 fps through the
windows tried (one 130 ms hitch at 1:24–1:32 on first play, as a batch of tiles
mounts).

## Soft spots, and what the user has not seen

- **None of it has been watched in motion by a person.** Sync and motion are
  theirs to judge: whether the easing through forks reads as hesitation, whether
  the stops are long enough, whether the pace (about 100 px/s) is right.
- Wrong turn 1 (Erie) and the Faith–Dupree one are short on the sheet (about
  130 and 85 px); they read, but they are quick. Lengthening either means a
  different road.
- Wrong turn 3 is a loop, not an out-and-back: from Mobridge he goes on west
  rather than back to Blunt. It reads as wrong because the road he left is on
  the map and Pierre is lettered beside it; it is the least obvious of the five.
- The route's own road is drawn into the map as a back road wherever Natural
  Earth has none, so it can be seen faintly ahead of the dot (and the roads to
  Erie's dock, Frenchglen and Dupree are among them).
- Away from the route the map has only Natural Earth's towns (about 700 in the
  country), so the West is sparse. That is honest, and it looks like the West.
- Through Chicago and the East the red line crosses a dense mesh of expressways;
  it sits on a breath of bare paper to stay readable.
- The five earlier proposals (Looking Astern, The Departure Board, The Lead
  Through the Ice, Telegraph Tape, A Tightrope to Eden) are in git before this
  commit.
