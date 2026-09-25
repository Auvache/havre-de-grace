<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Conman — the wall
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Four minutes of "Conman", track two of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking, as one wall made of sections. The wall is black; each
          section pasted onto it is a grid of one sheet repeated edge to edge:
          fly-posters, stamps, flyers, tickets, banknotes, framed pictures, amps,
          a tour schedule, sticker sheets. Each is one artist, the same stencil
          on every sheet. The song is about how being inspired by other
          musicians is a kind of theft, and how that is not a bad thing:
          everybody takes from everybody. So the words tear the sheets up,
          section by section; in the break the whole wall comes down into a
          pile, the last verse builds a new musician out of the pieces, and the
          last chorus pastes the wall back up in red, with his face on every
          sheet.
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
          <MusicVideoSvgFilm :film="wallFrame" name="The wall" :score="score" :t="frameTime" uid="film" />

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

      <!-- ── Style guide: every section, ten seconds each ──────────────── -->
      <section id="style-guide" class="space-y-12" @pointerdown.capture="player.pause()">
        <div class="space-y-4">
          <p class="label-text muted-text">
            Style guide / section by section
          </p>
          <h2 class="section-heading text-[1.6rem]">
            One wall, ten sections
          </h2>
          <p class="max-w-3xl text-base leading-relaxed muted-text">
            Each verse is split in two, and each half is its own section: one
            sheet format, one artist, one ink. Each chorus gives a section to
            each line it sings. The camera holds on a section and pans slowly
            across it while the words tear it up, starting small and ending in
            whole sheets, and moves quickly to the next. The red is the conman in
            every section. It lands on a sheet, and the next word tears that
            sheet.
          </p>
          <p class="max-w-3xl text-sm leading-relaxed muted-text">
            Every clip is a window of the film above, at its own place in the
            song. Starting a clip stops the film.
          </p>
        </div>

        <div class="space-y-10">
          <h3 class="section-heading text-[1.25rem]">
            Motion: the opening, the break and the end
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
              <MusicVideoSvgFilm :film="wallFrame" name="The wall" :score="score" :t="t" :uid="uid" />
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
          The wall, section by section
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a section of the same wall, or the moves
          between them. Click a section to jump to it.
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
          Everything that tears on the wall tears on one of these times.
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
 * /music-videos/conman — the whole song, as a wall of sections
 * (shared/video/films/conman-wall.mjs, on the tear in shared/video/torn.mjs;
 * app/config/albumStyle.ts). The torn gallery it replaced is still in
 * shared/video/films/gallery.mjs, and the banknote film before that in
 * engraving.mjs.
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/goodbye-norma-jeane: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/conmanScore.ts is the cut.
 */
import { CONMAN_SCORE, lineAt, sectionAt } from '~/config/conmanScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { WALL_INKS, slotWindow, wallFrame } from '~~/shared/video/films/conman-wall.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Conman — the wall',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = CONMAN_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the whole wall, the last section just
 * pasted up and nothing torn yet — the album's opening format, and what the
 * film is at rest before anyone presses play.
 */
const POSTER_AT = 19.5
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
 * The style guide: ten seconds of every section, each at its own place in the
 * song (slotWindow reads it off the score), and the parts of the film that are
 * not a section: the opening, the break, the last verse and the last chorus.
 */
const at = (id: string) => slotWindow(score, id) ?? { from: 0, to: 10 }
const MOTION = [
  { uid: 'm-open', title: 'The opening', from: 0, to: 10, posterAt: 1.5, caption: 'Black, and CONMAN in paper-white. The title drops to the margin, the paper comes in round the plate and leaves it black: that is the wall. Then the first sections are pasted onto it, one every other beat.' },
  { uid: 'm-paste', title: 'The paste-up, and in', from: 14, to: 24, posterAt: 19.5, caption: 'The last sections go up until the collage is whole, then fast into Jimmy Page\'s fly-posters, and the first rip lands on "conman".' },
  { uid: 'm-break', title: 'The break', from: 144, to: 162, posterAt: 151, caption: 'Right out, and the camera does not move. Every sheet on the wall is torn down, roughly from the bottom up. The pieces fall into a pile along the bottom of the plate, and what is left is the black wall.' },
  { uid: 'm-him', title: 'The last verse', from: 176, to: 190, posterAt: 186.9, caption: 'Pieces lift off the pile one or two at a time and lay down the outline of a musician with a guitar, made of everybody\'s scraps, while the camera creeps in on him.' },
  { uid: 'm-red', title: 'The last chorus', from: 187.5, to: 202, posterAt: 197, caption: 'Out again, and the wall is pasted back up over him on the beat, every section reprinted in red with his face on it: everything is his now. Then a section per line, and out on the red wall.' },
]
const section = (id: string) => ({ ...at(id), film: wallFrame })
const SECTIONS = [
  { uid: 's-1a', ...section('1a'), posterAt: 27.2, title: '1a · Jimmy Page, fly-posting', ink: WALL_INKS.posters, inkName: 'Tangerine', caption: 'The opener. The same poster pasted edge to edge: TONIGHT, Page\'s long dark hair, ONE NIGHT ONLY. Small pieces rip off one at a time with a few seconds between, each showing the older poster underneath. The red is a snipe, AGAIN, slapped on the next poster to go.' },
  { uid: 's-1b', ...section('1b'), posterAt: 38.2, title: '1b · Robert Plant, stamps', ink: WALL_INKS.stamps, inkName: 'Violet', caption: 'A sheet of the same stamp on a black stock page, with the big light mane printed in violet. A little faster and a little bigger than Page: corners, then strips. It holds through the guitar after the verse. The red is a postmark cancelling the stamps.' },
  { uid: 's-2a', ...section('2a'), posterAt: 61.6, title: '2a · Jack White, the notice board', ink: WALL_INKS.board, inkName: 'Black', caption: 'Black GUITAR LESSONS flyers on a pale board, with the red string pinned from flyer to flyer. It starts by pulling off the tear-off tabs and escalates to corners, then halves.' },
  { uid: 's-2b', ...section('2b'), posterAt: 70.6, title: '2b · Meg White, tickets', ink: WALL_INKS.tickets, inkName: 'Black', caption: 'ADMIT ONE, over and over, with a peppermint in the corner. Stubs come off along the perforation, then halves, then whole tickets, with more tickets underneath. On "Earth shook" the wall shakes and seven go at once. The red is a VOID stamp.' },
  { uid: 's-tour', ...section('tour'), posterAt: 80.6, title: 'Chorus · the tour schedule', ink: WALL_INKS.tour, inkName: 'Chartreuse', caption: 'The first chorus line, "no matter where I go": the same dates and cities over and over, no band on it, with a red pencil ring round tonight\'s date.' },
  { uid: 's-amps', ...section('amps'), posterAt: 91.6, title: 'Chorus · the equipment: amps', ink: WALL_INKS.amps, inkName: 'Tweed gold', caption: 'The second, "I always sound the same": a wall of amps, copied to get the sound. The tears show the speakers behind. The red is the pilot lamp lighting up.' },
  { uid: 's-3a', ...section('3a'), posterAt: 106.3, title: '3a · John Mayer, banknotes', ink: WALL_INKS.notes, inkName: 'Emerald', caption: 'An uncut sheet of notes with medium curly hair in every oval and "This note is a copy of a copy" along the top. Torn in halves and taken off whole, and under the sheet is another sheet of the same notes. The red is a serial number.' },
  { uid: 's-3b', ...section('3b'), posterAt: 117.6, title: '3b · Bob Dylan, the gallery', ink: WALL_INKS.gallery, inkName: 'Cobalt', caption: 'One frame over and over on the black wall, the bush of curls and the polka dots on cobalt. The pictures are ripped out to the black. The red is a gallery\'s "sold" dot.' },
  { uid: 's-meg', ...section('meg-stickers'), posterAt: 125.2, title: 'Chorus · Meg White, a sticker sheet', ink: WALL_INKS.megStickers, inkName: 'Black', caption: 'Sheets of die-cut stickers (her face, a peppermint drum, a snare) peeled off one by one down to the waxy liner, and then the whole sheet goes. The red is a star sticker.' },
  { uid: 's-gear', ...section('gear-stickers'), posterAt: 136.2, title: 'Chorus · the equipment as stickers', ink: WALL_INKS.gearStickers, inkName: 'Turquoise', caption: 'Sticker sheets of gear (an amp, a pedal, a cassette, a record), peeled faster and faster into the break.' },
]

/* What each section does, keyed by the score's section ids. */
const BEATS = [
  { id: 'intro', label: 'Intro', note: 'Black, and CONMAN in white. The title drops to the margin and the paper comes in round a black plate: the wall. The sections are pasted onto it one at a time, then fast into the fly-posters.' },
  { id: 'verse-1', label: 'Page, Plant', note: 'Jimmy Page on the fly-posters: small pieces, one at a time, a few seconds apart. Then a quick pan to Robert Plant\'s stamps, a little faster and a little bigger, held through the guitar after the verse.' },
  { id: 'verse-2', label: 'The Stripes', note: 'Jack White\'s notice board, the tabs first, and Meg White\'s tickets. On "Earth shook" the wall shakes and the section is torn up.' },
  { id: 'chorus-1', label: 'Chorus', note: 'A section for each line: the tour schedule, then the amps.' },
  { id: 'verse-3', label: 'Mayer, Dylan', note: 'John Mayer\'s banknotes, torn up and taken off whole to the notes beneath. Then Bob Dylan\'s gallery on the black wall.' },
  { id: 'chorus-2', label: 'Chorus', note: 'Meg White\'s sticker sheets, then the gear stickers.' },
  { id: 'break', label: 'Break', note: 'Right out, and still. The whole wall is torn down into a pile along the bottom, and the wall is left black.' },
  { id: 'verse-4', label: 'Him', note: 'The camera creeps in while pieces lift off the pile and lay down the outline of a new musician, made of everyone.' },
  { id: 'chorus-3', label: 'Last chorus', note: 'The wall is pasted back up over him in red, his face on every sheet. A section per line, then all the way out.' },
  { id: 'outro', label: 'Outro', note: 'The red wall holds. The cut to the end card is the last hit of the record.' },
]

const NOTES = [
  'Nobody tears anything. There is no hand: a piece rips from the edge of its sheet, folds back to show its unprinted side, tears free and tumbles out of the frame. The paper left behind shows its pale core along every rip.',
  'One artist per section, the same stencil on every sheet: the hair one angular mass, the face bare paper with nothing but its outline. A haircut and a shirt, never a likeness, and no names anywhere.',
  'Each section has its own ink. That is the album\'s one exception, since every other film has one second ink. Red is the conman: the snipe, the postmark, the string, the serial, the lamp. In the last chorus it is every section\'s ink, because everything belongs to whoever took it last.',
  'The camera never cuts: it holds on a section and pans slowly, and between sections it moves fast, pulling back through a long move so a jump across the wall reads as one flight. In the break it does not move at all.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and moved onto the vocal\'s own onsets. The band played to a click at 87.5 BPM, and the paste-ups land on its beats.',
  'One function draws all of it: wallFrame(t). The same file renders this page sixty times a second and can be walked frame by frame under node to write an mp4.',
]
</script>
