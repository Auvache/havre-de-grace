<template>
  <section>
    <SectionHeading
      title="bios"
      description="Three lengths, ready to paste. Copy one, or download it as a text file."
      heading-tag="h2"
    />

    <div class="mt-10 space-y-6">
      <ScrollReveal
        v-for="(bio, index) in pressBios"
        :key="bio.id"
        as="article"
        class-name="surface-card space-y-4 p-6"
        variant="section-up"
        :delay-ms="90 + index * 90"
        :distance-px="52"
        :blur-px="5"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <p class="label-text">{{ bio.label }}</p>
            <p class="mt-1 text-sm muted-text">{{ bio.usage }}</p>
          </div>
          <p class="text-sm muted-text">{{ wordCount(bio.text) }} words</p>
        </div>

        <!--
          `whitespace-pre-line` so the long bio keeps its paragraph breaks
          without the data file having to carry markup.
        -->
        <p class="whitespace-pre-line text-sm leading-relaxed muted-text">{{ bio.text }}</p>

        <div class="flex flex-wrap gap-3 pt-1 text-sm">
          <button
            type="button"
            class="inline-flex rounded-full border border-theme px-4 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            @click="copy(bio)"
          >
            {{ copiedId === bio.id ? 'copied' : 'copy text' }}
          </button>
          <a
            :href="textFileUrl(bio)"
            :download="`havre-de-grace-${bio.id}.txt`"
            class="inline-flex rounded-full border border-theme px-4 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            download .txt
          </a>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
import { pressBios, type PressBio } from '~~/shared/data/press'

const copiedId = ref<string | null>(null)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const wordCount = (text: string) => text.trim().split(/\s+/).length

/**
 * The .txt download is built in the browser from the same string the page
 * renders, rather than served as a file per bio. Three more static files would
 * be three more things to keep in step with shared/data/press.ts; the bytes are
 * already here.
 *
 * Encoded as a data: URL rather than an object URL so there is nothing to
 * revoke and the href survives re-renders.
 */
const textFileUrl = (bio: PressBio) =>
  `data:text/plain;charset=utf-8,${encodeURIComponent(`${bio.text}\n`)}`

const copy = async (bio: PressBio) => {
  try {
    await navigator.clipboard.writeText(bio.text)
    copiedId.value = bio.id
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copiedId.value = null
    }, 2000)
  }
  catch {
    // Clipboard access is denied on insecure origins and in some embedded
    // browsers. The text is selectable on the page and the .txt download sits
    // right beside this button, so there is nothing to recover from.
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>
