<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Ship to Stockholm — the wood engraving
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Four minutes sixteen of "Ship to Stockholm" as an end-grain wood
          engraving, track nine of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: white line cut out of a black block, the ice in one
          grey-blue, and one red. The song is an ultimatum. A man has had enough
          of the anger, of people going for each other instead of looking for an
          answer, of talking and never hearing back, and the ship back to
          Stockholm is the way out to a simpler time. But he is in love with what
          he is leaving, and he does not want to go. So the film is one long quay
          at night with the town behind him and the ship ahead, and he walks
          between them the whole song, and keeps turning round. One window in the
          town stays lit when every other light goes out, and it never answers.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Red is held back. Until he goes, the only red on the block is the
          ship's stern lantern. The red wake is torn open through the ice only
          once he is aboard and the ship moves. No video file anywhere: every
          frame is SVG drawn from the song's own clock and cut to a measured
          score, so things land where they are sung.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="woodEngravingFrame" name="Wood engraving" :score="score" :t="frameTime" uid="film" />

          <!-- The whole frame is the play button until it is playing. -->
          <button
            v-if="!player.playing.value"
            type="button"
            class="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors duration-200 hover:bg-black/0"
            aria-label="Play the film"
            @click="player.toggle()"
          >
            <span class="flex items-center gap-3 rounded-full bg-black/55 px-6 py-3 text-white backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span class="label-text text-[0.62rem]">
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 4:16' }}
              </span>
            </span>
          </button>
        </div>

        <MusicVideoTransport
          :time="player.time.value"
          :duration="score.duration"
          :progress="player.progress.value"
          :playing="player.playing.value"
          :muted="player.muted.value"
          :sections="score.sections"
          :current="currentSection"
          @toggle="player.toggle()"
          @seek="player.seek"
          @update:muted="player.muted.value = $event"
          @fullscreen="toggleFullscreen"
        />

        <p class="text-sm leading-relaxed muted-text">
          Space plays and pauses, the arrow keys jump five seconds (hold shift
          for fifteen), <kbd>M</kbd> mutes and <kbd>F</kbd> fills the screen.
          When something is wrong, the most useful note is a time and what you
          saw — "around 3:40 the window goes out before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One quay, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same quay. Click a section
          to jump to it.
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="beat in BEATS" :key="beat.id">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              :class="beat.id === currentSection.id ? 'text-[color:var(--color-accent)]' : ''"
              @click="player.seek(sectionFrom(beat.id))"
            >
              <span class="w-14 shrink-0 font-mono text-xs muted-text">
                {{ clock(sectionFrom(beat.id)) }}
              </span>
              <span class="label-text w-28 shrink-0 text-[0.55rem]">
                {{ beat.label }}
              </span>
              <span class="min-w-0 flex-1 text-sm leading-relaxed muted-text">
                {{ beat.note }}
              </span>
            </button>
          </li>
        </ol>
      </section>

      <!-- ── The cut ────────────────────────────────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The cut
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          {{ score.lines.length }} lines and {{ wordCount }} measured words.
          Everything that arrives on the block lands on one of these times.
          Click a line to jump to it.
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="line in score.lines" :key="line.index">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-2 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              :class="line.index === currentLine?.index ? 'text-[color:var(--color-accent)]' : ''"
              @click="player.seek(line.start - 0.35)"
            >
              <span class="w-14 shrink-0 font-mono text-xs muted-text">
                {{ stamp(line.start) }}
              </span>
              <span class="label-text w-24 shrink-0 text-[0.55rem] muted-text">
                {{ sectionLabel(line.section) }}
              </span>
              <span class="min-w-0 flex-1 text-sm">
                {{ line.text }}
              </span>
            </button>
          </li>
        </ol>
      </section>

      <section class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">
          Nothing on the block is hand-placed
        </p>
        <ul class="space-y-3 text-sm leading-relaxed muted-text">
          <li v-for="note in NOTES" :key="note" class="flex gap-3">
            <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
            <span>{{ note }}</span>
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="section-heading text-[1.35rem]">
          Elsewhere
        </h2>
        <ul class="space-y-2 text-sm leading-relaxed muted-text">
          <li>
            <NuxtLink to="/music-videos/album" class="underline">/music-videos/album</NuxtLink>
            — the album's art direction: the sheet, inks and motion all ten songs share.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — track one, the woodcut.
          </li>
          <li>
            <NuxtLink to="/music-videos/conman" class="underline">/music-videos/conman</NuxtLink>
            — track two, the torn gallery.
          </li>
          <li>
            <NuxtLink to="/music-videos/goodbye-norma-jeane" class="underline">/music-videos/goodbye-norma-jeane</NuxtLink>
            — track three, the screenprint.
          </li>
          <li>
            <NuxtLink to="/music-videos/ivory" class="underline">/music-videos/ivory</NuxtLink>
            — track four, the etching.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — track five, the engraved chart, which shares Stockholm with this one.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/ship-to-stockholm — the whole song, as the album's wood
 * engraving (shared/video/films/wood-engraving.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/ivory: the page owns the projector and
 * the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/shipToStockholmScore.ts is the cut.
 */
import { SHIP_TO_STOCKHOLM_SCORE, lineAt, sectionAt } from '~/config/shipToStockholmScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { woodEngravingFrame } from '~~/shared/video/films/wood-engraving.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Ship to Stockholm — the wood engraving',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = SHIP_TO_STOCKHOLM_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the first image — the town's lights
 * on the far shore, the ship a speck with its red lantern, and him walking in
 * along the quay with his sea bag — the album's opening format, and what the
 * film is at rest before anyone presses play.
 */
const POSTER_AT = 21
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)

const currentSection = computed(() => sectionAt(player.time.value))
const currentLine = computed(() => lineAt(player.time.value))
const wordCount = score.lines.reduce((n, line) => n + line.words.length, 0)

const sectionFrom = (id: string): number =>
  (score.sections.find((section) => section.id === id)?.from ?? 0) + 0.01

const sectionLabel = (id: string): string =>
  score.sections.find((section) => section.id === id)?.label ?? ''

const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, '0')}`

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

/* Keyboard on the window, as on /music-videos/andalusia: the thing being reviewed is the film. */
const onKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target && /^(?:INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const step = event.shiftKey ? 15 : 5
  switch (event.key) {
    case ' ':
      player.toggle()
      break
    case 'ArrowRight':
      player.seek(player.time.value + step)
      break
    case 'ArrowLeft':
      player.seek(player.time.value - step)
      break
    case 'm':
    case 'M':
      player.muted.value = !player.muted.value
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    default:
      return
  }
  event.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/* What each section does, keyed by the score's section ids. */
const BEATS = [
  {
    id: 'intro',
    label: 'Intro',
    note: 'The block is cut, a ragged edge sweeping across it: sky, the far shore, the sea, the ice along the quay. On the far shore to the left is the town, its windows lit; out on the water to the right is the ship, a speck with a red lantern. He walks in off the shingle with a sea bag on his shoulder. The album\'s title card underneath: 9/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Away',
    note: 'The town\'s windows go out behind him one by one across "away with the land and away with the light", all but one. Out on the water the ship\'s sails drop on "a\' sailing". The stars prick out through "follow the night". On "lost love" he stops and turns back to the one window still lit, and it glows.',
  },
  {
    id: 'verse-2',
    label: 'The ship',
    note: 'He turns and walks on to the harbour-master\'s hut: STOCKHOLM on the board, and a clock whose hands start to run on "waits on no man". The wind gets up on "the wind doesn\'t wait" — the snow goes sideways, the pennant streams. On "to get back to you" he turns and walks a few steps back towards the window with his hand out; on "bribing" coins spill from it, on "begging" he kneels, on "bleeding" he puts his hand to his chest.',
  },
  {
    id: 'break',
    label: 'Break',
    note: 'He gets up and walks on along the quay. Lamp posts carry the telephone wire from post to post; the ship is bigger now.',
  },
  {
    id: 'verse-3',
    label: 'Guns',
    note: 'Two crowds face each other across the quay and he walks into the middle. Rifles come up on "guns", fists on "fight"; on "fading" the lamps over them go out. On "done trying to prove" he stands between them with his arms out, and across "everyone\'s beyond persuading" they turn their backs on him one by one.',
  },
  {
    id: 'instrumental',
    label: 'Instrumental',
    note: 'The plate takes the whole sheet. A storm comes in: clouds over the moon, snow in streaks, the ice breaking into floes, the sea heaving, and the ship coming in through it with its lantern swinging. He walks into it bent double, and the lamps go out as he reaches them. Lightning; a wave breaks over the quay and puts him on one knee; the telephone wire snaps. When the bass drops out, so does the storm: the clouds tear away, the moon comes back, the harbour freezes to glass, and the ship lies moored in it with its sails furled.',
  },
  {
    id: 'verse-4',
    label: 'Thin ice',
    note: 'The band comes back in and he walks to the end of the quay. On "deep water" black lanes open in the ice; on "rescue" a plank is run out to him from the ship\'s stern; on "razor thin ice" cracks shoot across it. He walks out along the plank with his arms out like a tightrope walker, and on "Eden" a light comes up on the horizon. On "dogs" three dogs rush the end of the quay behind him, snarling at each other, and snap on "bite". The newspapers come over the ice — the same page, again and again on "repeating" — and on "no" the wind takes them.',
  },
  {
    id: 'verse-5',
    label: 'Stockholm',
    note: 'He turns round on the plank to face the window. On "make it back" he takes a letter from his coat and holds it up; on "reach you" he reaches; on "letter" the wind takes it back towards the town and it comes down short on the ice; on "phone" the broken wire sparks, and the window goes out. "So I\'m taking the ship": he turns, crosses, climbs the ladder, and the sails drop as he steps aboard. On "Stockholm" the ship casts off.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The plate takes the whole sheet again. The ship breaks out through the ice towards the light on the horizon, and behind it the red wake tears open — the one time in the film anything red travels. He stands at the stern looking back. The cut to the end card is the record\'s last hit.',
  },
]

const NOTES = [
  'Left is home and right is the ship. The town is on the far shore behind him, and the ship out on the water ahead is drawn in perspective from one point at the end of the quay: a speck at the start of the song and full size by the end of the storm, and it shrinks again as it sails away, so its wake narrows to the horizon.',
  'The one window that stays lit is never named — it can be a person, a place, a group or an idea. It swells when he turns to it on "lost love", "to get back to you" and "I just need to ask", and it goes out on "phone".',
  'Tone is cut the way an engraver on end grain cuts it: horizontal lines that swell where it is light and thin to nothing where it is dark. Glows — the moon, the lamps, the window, Eden — are rows of line whose ends are solved exactly for each row, so a light can move and fade without a single line being resampled.',
  'He is a walking speed, integrated: he walks, stops, turns back and walks a few steps the wrong way, kneels, walks into the storm bent double. The camera follows him but never slower than a drift, so it never stops; when he stops, it carries on and he slides back in the frame.',
  'Where each thing stands is solved from where he is when its word is sung: the hut from "Stockholm", the crowds from "fight", the end of the quay from "razor". Retime the score and the quay rearranges itself to match.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets, and the two lines verse 3 repeats of verse 1 solved once on their pooled evidence. The band played to a click at 105 BPM, and verses 2, 3 and 4 fall exactly 52, 144 and 260 beats after the first.',
  'One function draws all of it: woodEngravingFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
