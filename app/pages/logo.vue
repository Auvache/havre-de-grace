<template>
  <section class="page-container section-space">
    <header class="max-w-2xl">
      <p class="label-text muted-text">
        Brand assets
      </p>
      <h1 class="display-heading mt-3">
        the anchor suite
      </h1>
      <p class="muted-text mt-5">
        The signed-off marks and everything built from them. Each file is drawn geometry with the
        lettering outlined, so nothing depends on a font being installed, and each one paints with
        <code class="text-[0.9em]">currentColor</code> — set a colour on the
        <code class="text-[0.9em]">&lt;svg&gt;</code> or let it inherit, and the same file serves
        ink, reversed and accent.
      </p>
      <p class="muted-text mt-3 text-[0.95em]">
        Group D is the exception: those ship at fixed pixel dimensions with a background baked in.
      </p>
      <p class="muted-text mt-3 text-[0.95em]">
        Every file below is a live one. The earlier rounds this came out of are no longer here —
        they live in <code class="text-[0.9em]">tools/logo</code> and can be regenerated with
        <code class="text-[0.9em]">--archive</code> if they are ever wanted again.
      </p>
    </header>

    <!-- ── the suite ────────────────────────────────────────────── -->
    <div v-for="group in groups" :key="group.id" class="mt-16">
      <div class="max-w-2xl border-t border-theme pt-8">
        <h2 class="section-heading">
          {{ group.title }}
        </h2>
        <p class="muted-text mt-3 text-[0.95em]">
          {{ group.blurb }}
        </p>
      </div>

      <div class="mt-10 grid gap-8 md:grid-cols-2">
        <div
          v-for="asset in group.assets"
          :key="asset.href"
          :class="asset.wide ? 'md:col-span-2' : ''"
        >
          <LogoCard v-bind="asset" />
        </div>
      </div>
    </div>

    <!-- ── usage ────────────────────────────────────────────────── -->
    <div class="mt-20 border-t border-theme pt-8">
      <h2 class="section-heading">
        using them
      </h2>

      <div class="mt-10">
        <h3 class="label-text">
          Minimum size
        </h3>
        <p class="muted-text mt-3 max-w-2xl text-[0.95em]">
          Rendered live at the sizes below, so this is the real thing rather than a claim about it.
          The standard anchor starts losing its crown and its shackle around 24px — that is what the
          small-size draw exists to fix. Below 32px use A5, or C4 where a background is available.
        </p>

        <div class="mt-6 overflow-x-auto">
          <table class="min-w-[34rem] border-collapse text-left">
            <thead>
              <tr>
                <th class="pb-3 pr-6" />
                <th
                  v-for="size in SIZES"
                  :key="size"
                  class="label-text muted-text pb-3 pr-7 font-medium"
                >
                  {{ size }}px
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sizeRows" :key="row.id" class="border-t border-theme">
                <td class="muted-text py-4 pr-6 text-[0.85rem] whitespace-nowrap">
                  {{ row.label }}
                </td>
                <td v-for="size in SIZES" :key="size" class="py-4 pr-7 align-bottom">
                  <span class="size-chip" :style="{ '--size': `${size}px` }" v-html="row.svg" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-14">
        <h3 class="label-text">
          In use on the site
        </h3>
        <p class="muted-text mt-3 max-w-2xl text-[0.95em]">
          These files are the live source — the site inlines them rather than keeping a second
          copy, so editing a file here changes the site.
        </p>
        <dl class="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 md:max-w-3xl">
          <div v-for="row in IN_USE" :key="row.where" class="flex gap-3 border-t border-theme pt-3">
            <dt class="label-text shrink-0 pt-0.5 text-[0.62rem]">
              {{ row.asset }}
            </dt>
            <dd class="muted-text text-[0.85rem] leading-relaxed">
              {{ row.where }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-14">
        <h3 class="label-text">
          Clear space
        </h3>
        <p class="muted-text mt-3 max-w-2xl text-[0.95em]">
          Keep one module free on every side, the module being the cap height of the wordmark. The
          four shaded squares in E1 are that measure. Nothing crosses the dashed line — not type,
          not the edge of a photograph, not a card border.
        </p>
      </div>

      <div class="mt-14">
        <h3 class="label-text">
          Colour
        </h3>
        <p class="muted-text mt-3 max-w-2xl text-[0.95em]">
          Monochrome by default. The accent is the teal already running through the site, and it is
          the only colour these should take besides ink and reversed.
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-3 md:max-w-3xl">
          <div v-for="swatch in SWATCHES" :key="swatch.hex" class="surface-card overflow-hidden">
            <div class="h-24" :style="{ background: swatch.hex }" />
            <div class="p-4">
              <p class="text-[0.9rem] font-medium">
                {{ swatch.name }}
              </p>
              <p class="muted-text mt-0.5 text-[0.8rem] uppercase">
                {{ swatch.hex }}
              </p>
              <p class="muted-text mt-2 text-[0.8rem] leading-relaxed">
                {{ swatch.use }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-14">
        <h3 class="label-text">
          What not to do
        </h3>
        <p class="muted-text mt-3 max-w-2xl text-[0.95em]">
          Each of these is a live copy of A4 with one thing done to it. They are the six that
          actually happen.
        </p>

        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <figure v-for="item in MISUSE" :key="item.label" class="surface-card overflow-hidden">
            <div class="misuse-stage">
              <div class="misuse-art" :class="item.art" v-html="lockupSvg" />
              <span v-if="item.crowd" class="misuse-crowd">TOUR DATES</span>
            </div>
            <figcaption class="border-t border-theme p-4 text-[0.85rem] leading-relaxed">
              <span class="mr-1.5 text-[color:var(--color-accent)]">✕</span>{{ item.label }}
            </figcaption>
          </figure>
        </div>
      </div>
    </div>

    <!-- ── splash entrances, for choosing between ───────────────── -->
    <div class="mt-20 border-t border-theme pt-8">
      <h2 class="section-heading">
        splash entrances
      </h2>
      <SplashAnimationLab class="mt-6" :svg="lockupSvg" />
    </div>
  </section>
</template>

<script setup lang="ts">
import LogoCard from '~/components/logo/LogoCard.vue'
import SplashAnimationLab from '~/components/logo/SplashAnimationLab.vue'

// The files under public/logos are the deliverable, so they are also the source
// for this page: inlining them with ?raw lets page CSS recolour the artwork for
// the dark stage and the misuse examples, which an <img> could not do.
const suiteFiles = import.meta.glob('../../public/logos/suite/*.svg', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>

interface AssetNote {
  name: string
  note: string
  wide?: boolean
  fixed?: boolean
}

const NOTES: Record<string, AssetNote> = {
  a1: { name: 'the anchor', note: 'The mark alone. Use it wherever the name is already on the surface — a sleeve spine, a stamp, a strap end, the top of a page that says who you are three lines later.' },
  a2: { name: 'the seal', note: 'The badge. Reads as a circle from across a room and rewards a closer look. Merch, stamps, the back of a sleeve.' },
  a3: { name: 'the seal, reversed', note: 'Cut out of a filled disc rather than painted white, so the rules and the anchor take the colour behind them. One file for paper, dark screens and photographs.' },
  a4: { name: 'the primary lockup', note: 'Anchor over the name. If only one file ever gets used, it should be this one.' },
  a5: { name: 'the anchor, small sizes', note: 'Fatter crown and stock, an opened shackle, broader bills. The standard draw thins out below about 32px; this is what to use under it.' },
  a6: { name: 'the seal, small sizes', note: 'One rule instead of two, thickened until it still holds a pixel of ink, carrying the compact anchor. The two rules on A2 sit 22 units apart on a 680-unit box — under a pixel at nav and favicon sizes, where they merge. Use it under 64px.' },

  b1: { name: 'horizontal · two lines', note: 'Anchor beside a two-line wordmark with a hairline rule between. Site headers, letterheads, poster credits.', wide: true },
  b2: { name: 'horizontal · one line', note: 'The most compact lockup in the set. Navigation bars, email signatures, anywhere vertical space is the constraint.', wide: true },
  b3: { name: 'stacked · two lines', note: 'Structurally your existing logo, redrawn around the new anchor. The continuity option.' },
  b5: { name: 'wordmark', note: 'Type alone, one line. For surfaces where the mark already appears somewhere else.', wide: true },
  b6: { name: 'wordmark · two lines', note: 'Type alone, stacked. Narrow columns and portrait formats.' },
  b7: { name: 'badge lockup', note: 'Seal over the name. The merch version — heavier and more ceremonial than A4.' },

  b8: { name: 'nav lockup', note: 'The name set at two thirds the height of the anchor, so the mark stands proud of the lettering instead of sitting level with it. Drawn with the compact anchor, since this is always rendered small.', wide: true },
  b9: { name: 'nav lockup · seal', note: 'The same lockup carrying the seal. The disc is not matched to the anchor height it replaces — two fifths of it is rule and clear space, so height for height it reads as a smaller mark; it is matched on the anchor inside the rule instead. This is what the site navigation uses.', wide: true },
  c1: { name: 'app icon', note: 'Rounded square, anchor cut out. Home screens, app stores, and any favicon above 32px.' },
  c2: { name: 'app icon · seal', note: 'The same tile carrying the badge, for when the seal is the thing people recognise. Watch it below 64px — the inner rule is the first detail to close up.' },
  c3: { name: 'avatar', note: 'Circular, for the platforms that round your picture whatever you upload. Sized so nothing important sits near the crop.' },
  c5: { name: 'icon · square', note: 'The same tile with square corners. Apple and Android round and mask home-screen icons themselves, so a pre-rounded tile gets rounded twice — this is the one those platforms get.' },
  c4: { name: 'favicon tile', note: 'Built on the small-size anchor rather than the standard one, and the one file in the group that paints the anchor instead of knocking it out — a cut-out takes the colour of the tab strip behind it. This is the file that survives 16px.' },

  d1: { name: 'share card', note: '1200×630, on paper white. The light alternative to D2 — swap them in usePageSeo if the ink card ever sits badly against a platform’s own chrome.', wide: true, fixed: true },
  d2: { name: 'share card · dark', note: 'The same card in ink, and the one in use: this is what unfurls when anyone posts a link to the site, on every page, album and song. Rasterised to og-image.png.', wide: true, fixed: true },
  d3: { name: 'profile header', note: '1500×500. The lockup is centred, so check it against each platform before committing — most punch an avatar hole in the lower left.', wide: true, fixed: true },
  d4: { name: 'square post', note: '1080×1080 on the site accent. Release announcements, show posts.', fixed: true },

  e1: { name: 'clear space', note: 'The rule drawn rather than described: one module clear on every side, the module being the wordmark cap height. The shaded squares are that measure.', wide: true },
}

const GROUPS = [
  { prefix: 'a', title: 'a · core marks', blurb: 'The four signed off, plus a small-size draw of the anchor. Everything else on this page is built from these.' },
  { prefix: 'b', title: 'b · lockups', blurb: 'For when the name has to travel with the mark. Pick by the shape of the space you are filling rather than by preference — a wide gap wants B2, a tall one wants A4.' },
  { prefix: 'c', title: 'c · icons and avatars', blurb: 'Square and circular crops, drawn at 512px so they downsample cleanly. Export to PNG at whatever sizes each platform asks for.' },
  { prefix: 'd', title: 'd · composed assets', blurb: 'Ready to use at the dimensions they ship at, backgrounds included. The only files here that are not recolourable.' },
  { prefix: 'e', title: 'e · guides', blurb: 'The one rule worth having as a drawing rather than a sentence.' },
]

const toAssets = (sources: Record<string, string>, dir: string) =>
  Object.entries(sources)
    .map(([path, svg]) => {
      const file = path.split('/').pop() as string
      const key = file.replace(/\.svg$/, '')
      const id = key.split('-')[0] as string
      const meta = NOTES[id]
      return {
        href: `/logos/${dir}/${file}`,
        svg,
        index: id.toUpperCase(),
        name: meta?.name ?? key,
        note: meta?.note ?? '',
        wide: meta?.wide ?? false,
        fixed: meta?.fixed ?? false,
        group: id[0],
      }
    })
    .sort((a, b) => a.href.localeCompare(b.href))

const suite = toAssets(suiteFiles, 'suite')

const groups = GROUPS
  .map((group) => ({ ...group, id: group.prefix, assets: suite.filter((a) => a.group === group.prefix) }))
  .filter((group) => group.assets.length > 0)

const SIZES = [16, 20, 24, 32, 48]

const byId = (id: string) => suite.find((a) => a.index.toLowerCase() === id)

const sizeRows = [
  { id: 'a1', label: 'A1 · anchor' },
  { id: 'a5', label: 'A5 · anchor, small' },
  { id: 'a6', label: 'A6 · seal, small' },
  { id: 'c1', label: 'C1 · app icon' },
  { id: 'c4', label: 'C4 · favicon tile' },
]
  .map((row) => ({ ...row, svg: byId(row.id)?.svg ?? '' }))
  .filter((row) => row.svg)

const lockupSvg = computed(() => byId('a4')?.svg ?? '')

const IN_USE = [
  { asset: 'B9', where: 'Site navigation bar, from small screens up.' },
  { asset: 'A4', where: 'Splash screen, the site footer, the /links hub, and brand-logo.png for structured data.' },
  { asset: 'A6', where: 'The navigation bar on phones, where the name is dropped and the seal rides alone.' },
  { asset: 'C4', where: 'favicon.svg, and favicon.ico at 16, 32 and 48px for browsers without SVG favicon support.' },
  { asset: 'C5', where: 'apple-touch-icon.png and the Android home-screen icons in the web manifest.' },
  { asset: 'D2', where: 'og-image.png — the share card every page unfurls to when a link is posted.' },
]

const SWATCHES = [
  { name: 'Ink', hex: '#16191d', use: 'The default. Everything is drawn in this unless there is a reason not to be.' },
  { name: 'Off-white', hex: '#f4f6f7', use: 'Reversed, on ink or over a dark photograph. Not pure white — it sits softer against the ink.' },
  { name: 'Accent', hex: '#3d7a8a', use: 'The teal already running through the site. Sparingly, and never on the anchor and the type at once.' },
]

const MISUSE = [
  { label: 'Stretch or squash it. The proportions are the mark.', art: 'is-stretched' },
  { label: 'Tilt it. An anchor hangs straight down.', art: 'is-tilted' },
  { label: 'Put a shadow or a glow behind it.', art: 'is-shadowed' },
  { label: 'Split it into two colours.', art: 'is-two-tone' },
  { label: 'Crowd it. Respect the clear space.', art: 'is-crowded', crowd: true },
  { label: 'Fade it down to make it "subtle".', art: 'is-faded' },
]

usePageSeo({
  title: 'Brand assets | Havre De Grace',
  description: 'The Havre De Grace anchor suite: marks, lockups, icons and usage.',
})
</script>

<style scoped>
.size-chip {
  display: inline-flex;
  align-items: flex-end;
}

.size-chip :deep(svg) {
  height: var(--size);
  width: auto;
}

.misuse-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11rem;
  overflow: hidden;
  padding: 1.5rem;
  background: #ffffff;
  color: #16191d;
}

.misuse-art :deep(svg) {
  display: block;
  height: 6.5rem;
  width: auto;
}

.is-stretched :deep(svg) {
  transform: scaleX(1.7);
}

.is-tilted :deep(svg) {
  transform: rotate(-13deg);
}

.is-shadowed :deep(svg) {
  filter: drop-shadow(0 6px 5px rgb(0 0 0 / 0.45));
}

/* Recolouring by group is exactly the move that pulls the lockup apart. */
.is-two-tone :deep(svg) {
  color: #3d7a8a;
}

.is-two-tone :deep(svg > g:last-child) {
  color: #b8543f;
}

.is-crowded :deep(svg) {
  height: 5.5rem;
}

.misuse-crowd {
  position: absolute;
  top: 50%;
  right: 0.85rem;
  transform: translateY(-50%);
  font-size: 0.8rem;
  letter-spacing: 0.18em;
}

.is-faded :deep(svg) {
  opacity: 0.22;
}
</style>
