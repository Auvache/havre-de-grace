<template>
  <article :id="spec.id" class="scroll-mt-24 border-t border-theme pt-10">
    <header class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
      <h3 class="section-heading text-[1.5rem]">
        {{ spec.name }}
      </h3>
      <code class="text-[0.78rem] muted-text">{{ spec.id }}</code>
      <span class="label-text text-[0.58rem]" :class="effortClass">
        {{ spec.effort }} build
      </span>
    </header>

    <p class="mt-3 max-w-3xl text-base leading-relaxed muted-text">
      {{ spec.tagline }}
    </p>

    <div class="mt-7">
      <VideoStyleSheet :src="spec.sheet" />
      <p class="mt-3 text-[0.8rem] muted-text">
        Frame is the top 16:9. The strip under it is apparatus —
        <a :href="spec.sheet" class="underline" target="_blank" rel="noopener">open the file</a>.
      </p>
    </div>

    <details class="mt-8 surface-card p-6">
      <summary class="label-text cursor-pointer select-none text-[0.62rem]">
        The spec — everything an agent needs to build it
      </summary>

      <div class="mt-6 space-y-8">
        <section>
          <h4 class="label-text text-[0.58rem]">
            Premise
          </h4>
          <p class="mt-2 max-w-3xl text-sm leading-relaxed muted-text">
            {{ spec.premise }}
          </p>
        </section>

        <section>
          <h4 class="label-text text-[0.58rem]">
            Palette
          </h4>
          <ul class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="colour in spec.palette" :key="colour.hex" class="flex gap-3">
              <span
                class="mt-0.5 h-8 w-8 shrink-0 rounded-sm border border-theme"
                :style="{ backgroundColor: colour.hex }"
              />
              <span class="min-w-0 text-sm">
                <span class="block">{{ colour.name }} <code class="text-[0.85em] muted-text">{{ colour.hex }}</code></span>
                <span class="block text-[0.85em] leading-snug muted-text">{{ colour.role }}</span>
              </span>
            </li>
          </ul>
        </section>

        <section v-for="list in bulletSections" :key="list.title">
          <h4 class="label-text text-[0.58rem]">
            {{ list.title }}
          </h4>
          <ul class="mt-2 space-y-2">
            <li v-for="item in list.items" :key="item" class="flex gap-3 text-sm leading-relaxed muted-text">
              <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>

        <section>
          <h4 class="label-text text-[0.58rem]">
            What moves, and what moves it
          </h4>
          <dl class="mt-2 space-y-2">
            <div v-for="(beat, index) in spec.motion" :key="index" class="flex gap-3 text-sm leading-relaxed">
              <dt class="label-text w-20 shrink-0 pt-1 text-[0.55rem] text-[color:var(--color-accent)]">
                {{ beat.driver }}
              </dt>
              <dd class="min-w-0 muted-text">
                {{ beat.does }}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 class="label-text text-[0.58rem]">
            Section by section
          </h4>
          <dl class="mt-2 divide-y divide-[color:var(--theme-border)] border-y border-theme">
            <div v-for="row in sectionRows" :key="row.id" class="flex gap-4 py-2 text-sm leading-relaxed">
              <dt class="label-text w-28 shrink-0 pt-1 text-[0.55rem] muted-text">
                {{ row.label }}
              </dt>
              <dd class="min-w-0 muted-text">
                {{ row.text }}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 class="label-text text-[0.58rem]">
            Drawings
          </h4>
          <p class="mt-2 max-w-3xl text-sm leading-relaxed muted-text">
            {{ spec.motifs }}
          </p>
        </section>
      </div>
    </details>
  </article>
</template>

<script setup lang="ts">
import type { VideoStyle } from '~/config/videoStyles'
import { SECTIONS } from '~/config/andalusiaScore'

const props = defineProps<{ spec: VideoStyle }>()

const effortClass = computed(() => ({
  low: 'text-[color:var(--color-accent)]',
  medium: 'muted-text',
  high: 'muted-text',
}[props.spec.effort]))

const bulletSections = computed(() => [
  { title: 'Type', items: props.spec.type },
  { title: 'Layout', items: props.spec.layout },
  { title: 'What would ruin it', items: props.spec.avoid },
])

/*
 * The section rows are keyed off the score rather than off the style, so a
 * style that forgets to say what its oh-ohs do shows an empty row instead of
 * quietly omitting the hardest fifteen seconds in the song.
 */
const sectionRows = computed(() =>
  SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    text: props.spec.sections[section.id as keyof VideoStyle['sections']] ?? '— not specified —',
  })),
)
</script>
