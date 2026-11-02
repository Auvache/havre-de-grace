<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Conman — the board
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Four minutes of "Conman", track two of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking, as two boards on black. The song is about how being
          inspired by other musicians is a kind of theft, and how that is not a
          bad thing: everybody takes from everybody, and if you are lucky
          somebody takes from you. The first board is theirs, the artists I
          love: sixteen sections, each a grid of one sheet in its own ink
          (posters, stamps, flyers, banknotes, tickets, amps, sleeves). The
          words tear it up section by section, and in the break it is torn off
          down to the black. Then a second board is pasted up out of its scraps.
          That one is mine, printed in red, with my face made of pieces of
          theirs, and by the end others are tearing it too.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          No video file anywhere. Every frame is SVG drawn from the song's own
          clock and cut to a measured score, so things tear where they are sung.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Under the film:
          <a href="#style-guide" class="underline">the style guide, ten seconds of every section</a>.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="boardFrame" name="The board" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 4:00' }}
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
          saw — "around 1:43 the tickets tear before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── Panning tests: sections five times the size ───────────────── -->
      <section id="panning" class="space-y-10" @pointerdown.capture="player.pause()">
        <div class="space-y-4">
          <p class="label-text muted-text">
            Test / 0:23–0:45
          </p>
          <h2 class="section-heading text-[1.6rem]">
            Panning inside a section, whipping between them
          </h2>
          <p class="max-w-3xl text-base leading-relaxed muted-text">
            Every section holds five times the sheets at the same size, so the
            frame shows as many sheets as before. The camera arrives on the
            middle of a section and pans slowly across it while the line is
            sung, then whips to the middle of the next. These are five ways of
            reading that, all on the first verse: the posters, the stamps, the
            guitar lessons and the banknotes, three whips in all (about 0:28,
            0:34 and 0:39). Nothing else has changed: the tears are the
            film's.
          </p>
        </div>
        <MusicVideoClip
          v-for="clip in PAN_CLIPS"
          :key="clip.uid"
          :title="clip.title"
          :from="22.4"
          :to="45"
          :poster-at="clip.posterAt"
          :uid="clip.uid"
          :src="score.src"
        >
          <template #film="{ t, uid }">
            <MusicVideoSvgFilm :film="clip.film" :name="clip.title" :score="score" :t="t" :uid="uid" />
          </template>
          {{ clip.caption }}
        </MusicVideoClip>
      </section>

      <!-- ── Style guide: every section, ten seconds each ──────────────── -->
      <section id="style-guide" class="space-y-12" @pointerdown.capture="player.pause()">
        <div class="space-y-4">
          <p class="label-text muted-text">
            Style guide / section by section
          </p>
          <h2 class="section-heading text-[1.6rem]">
            Their board, fourteen sections
          </h2>
          <p class="max-w-3xl text-base leading-relaxed muted-text">
            The board is four sections by four, each exactly the plate's shape,
            and the camera walks it one neighbour at a time without zooming:
            a section a line through the first two verses and the first chorus,
            a section a half through the third verse, and a section a line
            through the second chorus. The words tear the sheets in view,
            nicks first and whole sheets last. Two sections, the setlists and
            the sold-out posters, are only ever seen from far off.
          </p>
          <p class="max-w-3xl text-sm leading-relaxed muted-text">
            Every clip is a window of the film above, at its own place in the
            song. Starting a clip stops the film.
          </p>
        </div>

        <div class="space-y-10">
          <h3 class="section-heading text-[1.25rem]">
            Motion: the opening, the break, my board and the end
          </h3>
          <MusicVideoClip
            v-for="clip in MOTION"
            :key="clip.uid"
            :title="clip.title"
            :from="clip.from"
            :to="clip.to"
            :poster-at="clip.posterAt"
            :uid="clip.uid"
            :src="score.src"
          >
            <template #film="{ t, uid }">
              <MusicVideoSvgFilm :film="boardFrame" name="The board" :score="score" :t="t" :uid="uid" />
            </template>
            {{ clip.caption }}
          </MusicVideoClip>
        </div>

        <div class="space-y-10">
          <h3 class="section-heading text-[1.25rem]">
            The sections, in order
          </h3>
          <MusicVideoClip
            v-for="clip in SECTIONS"
            :key="clip.uid"
            :title="clip.title"
            :from="clip.from"
            :to="clip.to"
            :poster-at="clip.posterAt"
            :uid="clip.uid"
            :src="score.src"
          >
            <template #film="{ t, uid }">
              <MusicVideoSvgFilm :film="clip.film" :name="clip.title" :score="score" :t="t" :uid="uid" />
            </template>
            <span class="mr-2 inline-flex items-center gap-1.5 align-middle font-mono text-xs">
              <span class="inline-block h-3 w-3 rounded-full border border-theme" :style="{ background: clip.ink }" />
              {{ clip.inkName }}
            </span>
            {{ clip.caption }}
          </MusicVideoClip>
        </div>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The film, part by part
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a section of one board or the other, or
          the moves between them. Click a section to jump to it.
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
          Everything that tears on either board tears on one of these times.
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
          Everybody takes from everybody
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
            <NuxtLink to="/music-videos/goodbye-norma-jeane" class="underline">/music-videos/goodbye-norma-jeane</NuxtLink>
            — track three, the screenprint.
          </li>
          <li>
            <NuxtLink to="/music-videos/ivory" class="underline">/music-videos/ivory</NuxtLink>
            — track four, the etching.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — track five, the engraved chart.
          </li>
          <li>
            <NuxtLink to="/music-videos/ship-to-stockholm" class="underline">/music-videos/ship-to-stockholm</NuxtLink>
            — track nine, the wood engraving.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/conman — the whole song, as two boards: theirs torn down, mine
 * pasted up out of the scraps (shared/video/films/conman-board-film.mjs, on the
 * board in conman-board.mjs and the tear in shared/video/torn.mjs;
 * app/config/albumStyle.ts). The plan was decided on the stills in
 * conman-board-stills.mjs (a sheet of them: tools/video-styles/conman-board-mock.mjs).
 * The wall it replaced is still in shared/video/films/conman-wall.mjs.
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/goodbye-norma-jeane: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/conmanScore.ts is the cut.
 */
import { CONMAN_SCORE, lineAt, sectionAt } from '~/config/conmanScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { PANS, boardFrame, boardWindow } from '~~/shared/video/films/conman-board-film.mjs'
import { BOARD_INKS, SECTION } from '~~/shared/video/films/conman-board.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Conman — the board',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = CONMAN_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: their first section whole, just through the porthole, the
 * margin still empty — what the film is at rest before anyone presses play.
 */
const POSTER_AT = 15
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

/*
 * The style guide: ten seconds of each of their sections, each at its own
 * place in the song (boardWindow reads it off the score), and the parts of the
 * film that are not one of their sections.
 */
const MOTION = [
  { uid: 'm-open', title: 'The opening', from: 0, to: 12, posterAt: 4.9, caption: 'CONMAN on black. The band\'s mark is stamped down on it and knocks the letters flying, then the camera dives through the anchor\'s ring onto their first section, whole, and the ring\'s rim becomes the paper border.' },
  { uid: 'm-shook', title: '"Until the Earth shook"', from: 64.5, to: 72.5, posterAt: 68.9, caption: 'The one moment before the break when more than one sheet goes at once: the board shakes and everything in view is torn.' },
  { uid: 'm-break', title: 'The break', from: 138.5, to: 165.5, posterAt: 150, caption: 'Out to the whole board, the paper border eased away to the full frame. Every sheet is torn off, the cork and the banknotes\' backing with them, until nothing is left but the black.' },
  { uid: 'm-mine', title: 'My board, pasted up', from: 163.5, to: 173.5, posterAt: 168.5, caption: 'A fast zoom in from the black onto the first section as the scraps fly in and paste down, faster and faster. Each sheet is pieced together from theirs, then the red is pulled down over it: my face, made of pieces of theirs.' },
  { uid: 'm-taken', title: 'Being taken from', from: 175.5, to: 190, posterAt: 187, caption: 'The third line of the last verse, "Don\'t protect me from the damage in my wake": the first small pieces come off my board, a nick at a time.' },
  { uid: 'm-end', title: 'The last chorus and the end', from: 219.5, to: 234, posterAt: 231.5, caption: 'A section a line through the last chorus, torn harder each time. Then out to my whole board, torn at all over, and the end card cuts in on the last hit with about half of it gone and pieces still in the air.' },
]
const INK_NAMES: Record<string, string> = {
  posters: 'Tangerine', stamps: 'Violet', lessons: 'Black', soldOut: 'Kelly green', notes: 'Emerald', magazines: 'Pink',
  drummer: 'Fluorescent yellow', setlists: 'Highlighter', cheques: 'Sky', score: 'Sepia', cassettes: 'Turquoise',
  tickets: 'Black', amps: 'Tweed gold', tour: 'Chartreuse', sleeves: 'Cobalt', passes: 'Lilac',
}
const INK_KEY: Record<string, string> = { A: 'posters', B: 'stamps', C: 'lessons', D: 'notes', E: 'cheques', F: 'amps', G: 'tour', H: 'score', I: 'cassettes', J: 'sleeves', K: 'passes', L: 'tickets', M: 'drummer', N: 'magazines' }
const WHAT: Record<string, string> = {
  A: 'Jimmy Page on fly-posters: TONIGHT, the long dark hair, ONE NIGHT ONLY. The first nicks, a few seconds apart.',
  B: 'Robert Plant on a sheet of stamps, the big light mane in violet, perforated on the black.',
  C: 'Jack White\'s GUITAR LESSONS flyers pinned to a cork board. The tear-off tabs go first.',
  D: 'John Mayer on an uncut sheet of banknotes, "This note is a copy of a copy". It holds through the guitar after the verse.',
  E: 'Royalty cheques, pay to the order of whoever comes next.',
  F: 'A wall of amps, SOUNDS LIKE.',
  G: 'The tour schedule, the same dates over and over. On "Earth shook" the board shakes and everything in view goes.',
  H: 'Sheet music, "Study in D, after everybody".',
  I: 'The first chorus line: cassettes, side A, songs I borrowed.',
  J: 'The second: Bob Dylan on record sleeves, the record half out.',
  K: 'The first half of the third verse: backstage passes, ALL ACCESS, ARTIST.',
  L: 'The second half: Meg White on concert tickets, ADMIT ONE.',
  M: 'The second chorus: DRUMMER WANTED flyers on cork, influences a must.',
  N: 'The last section before the break: music magazines, "Who stole the riff?", torn hardest.',
}
const SECTIONS = Object.keys(WHAT).map((id) => {
  const w = boardWindow(score, 'old', id) ?? { from: 0, to: 10 }
  return { uid: `s-${id}`, ...w, posterAt: Math.round((w.from + 5) * 10) / 10, title: `${id} · ${SECTION[id].label}`, film: boardFrame, ink: BOARD_INKS[INK_KEY[id]!], inkName: INK_NAMES[INK_KEY[id]!], caption: WHAT[id] }
})

/*
 * The panning tests (PANS in the film): each section √5 plates by √5, five
 * times the sheets, except the fourth, five plates in a row.
 */
const PAN_TEXT: Record<string, { title: string, posterAt: number, caption: string }> = {
  'pan-1': { title: '1 · Pan towards the next, then whip', posterAt: 26.5, caption: 'The plainest reading. The pan heads slowly for the next section, so the whip carries on the way the camera was already going: half a second, still at both ends and a blur in the middle.' },
  'pan-2': { title: '2 · Wander, then snap past and settle', posterAt: 31, caption: 'The pan goes its own way on a slight curve, often away from where it will go next. The move is a spring let go: it gets there in a fifth of a second, overshoots by three or four sheets and settles back onto the middle.' },
  'pan-3': { title: '3 · Whip with a roll and a smear', posterAt: 31, caption: 'The pan as in 1, but the whip rolls the camera over by up to 14° and back and smears the board along the way it is going, like a head turned too fast.' },
  'pan-4': { title: '4 · Five sections in a row', posterAt: 26.5, caption: '"The exact section, but five of them" taken literally: five plates side by side, so each section is a long strip. The pan runs along the strip, faster. A move sideways is five plates in six tenths of a second; a move down is only one.' },
  'pan-5': { title: '5 · Yanked out and dropped in', posterAt: 31, caption: 'The pan wanders as in 2. The move pulls back off the board, far enough to glimpse the sections around it, and drops onto the middle of the next one in eight tenths of a second.' },
}
const PAN_CLIPS = PANS.map((p) => ({ uid: `p-${p.key}`, film: p.frame, ...PAN_TEXT[p.key]! }))

/* What each section does, keyed by the score's section ids. */
const BEATS = [
  { id: 'intro', label: 'Intro', note: 'CONMAN on black, the band\'s mark stamped down on it, and the dive through the anchor\'s ring onto their board.' },
  { id: 'verse-1', label: 'A–D', note: 'A section a line: fly-posters, stamps, guitar-lesson flyers, banknotes. Nicks, a few seconds apart.' },
  { id: 'verse-2', label: 'E–H', note: 'Cheques, amps, the tour schedule, sheet music. On "Earth shook" the board shakes and everything in view is torn.' },
  { id: 'chorus-1', label: 'I, J', note: 'A section for each line: cassettes, then record sleeves.' },
  { id: 'verse-3', label: 'K, L', note: 'A section for each half: backstage passes, then concert tickets.' },
  { id: 'chorus-2', label: 'M, N', note: 'Drummer-wanted flyers, then music magazines, torn hardest.' },
  { id: 'break', label: 'Break', note: 'Out to the whole board, and all of it torn off down to the black. Nothing is left.' },
  { id: 'verse-4', label: 'Mine', note: 'A fast zoom in as my board is pasted up out of their scraps and printed in red. On the third line the first nicks come off it.' },
  { id: 'chorus-3', label: 'Last chorus', note: 'A section of mine a line, torn harder each time.' },
  { id: 'outro', label: 'Outro', note: 'Out to my whole board, torn at all over. The cut to the end card is the last hit of the record.' },
]

const NOTES = [
  'Nobody tears anything. There is no hand: a piece rips from the edge of its sheet, folds back to show its unprinted side, tears free and tumbles out of the frame. The paper left behind shows its pale core along every rip.',
  'One artist per section, the same stencil on every sheet: the hair one angular mass, the face bare paper with nothing but its outline. A haircut and a shirt, never a likeness, and no names anywhere.',
  'Each of their sections has its own ink, the album\'s one exception. Mine is all in the album\'s red, the colour that means going in every film, and it is made of theirs: every sheet is a collage of their scraps with my print pulled over it, and the scraps show through wherever the print leaves paper, the face above all.',
  'The camera never cuts and never zooms on their board: it holds on a section, drifting, and moves to a neighbour. It pulls out only for the break and the end.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and moved onto the vocal\'s own onsets. The band played to a click at 87.5 BPM, and whatever tears between words tears on its eighths.',
  'One function draws all of it: boardFrame(t). The same file renders this page sixty times a second and can be walked frame by frame under node to write an mp4.',
]
</script>
