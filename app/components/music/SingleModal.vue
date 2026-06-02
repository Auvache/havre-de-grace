<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="album"
        class="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="album.title"
        @click.self="emit('close')"
      >
        <Transition name="single-modal" appear>
          <article
            v-if="album"
            ref="panelRef"
            class="absolute inset-x-0 bottom-0 max-h-[100dvh] overflow-y-auto rounded-t-[1.5rem] border border-white/10 bg-[color:var(--color-bg-dark)] text-[var(--color-text-dark)] shadow-[0_30px_60px_rgb(0_0_0_/_0.42)] md:inset-1/2 md:w-[min(480px,90vw)] md:max-h-[min(88dvh,52rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-lg)]"
            @pointerdown="onPanelPointerDown"
            @pointerup="onPanelPointerUp"
          >
            <div class="sticky top-0 z-[1] flex justify-end bg-[linear-gradient(to_bottom,rgba(27,31,36,0.96),rgba(27,31,36,0.72),transparent)] px-5 pt-5">
              <button
                ref="closeButtonRef"
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 text-2xl leading-none text-white"
                aria-label="Close single details"
                @click="emit('close')"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div class="px-5 pb-8 pt-2 md:px-8 md:pb-9">
              <NuxtImg
                :src="album.coverImage"
                :alt="album.coverAlt"
                width="600"
                height="600"
                sizes="(max-width: 767px) 88vw, 400px"
                format="webp,avif"
                class="mx-auto aspect-square w-full max-w-[min(400px,70vw)] rounded-[var(--radius-md)] object-cover shadow-[0_24px_50px_rgb(0_0_0_/_0.38)]"
              />

              <p class="mt-6 text-[length:var(--font-size-label)] uppercase tracking-[0.2em] text-[var(--color-muted-dark)]">
                {{ releaseLabel }}
              </p>
              <h2 class="mt-2 text-[length:var(--font-size-subheading)] font-[450] leading-tight">
                {{ album.title }}
              </h2>
              <p
                v-if="album.description"
                class="mt-5 text-[length:var(--font-size-body)] font-[350] leading-[1.65] text-[var(--color-text-dark)]/92"
              >
                {{ album.description }}
              </p>

              <StreamingLinks
                v-if="hasStreamingLinks"
                :links="album.streamingLinks"
                class="mt-7"
              />
              <p v-else class="mt-7 text-sm text-[var(--color-muted-dark)]">
                Streaming links coming soon.
              </p>
            </div>
          </article>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  album: Album | null
}>()

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)
let swipeStartY = 0

const hasStreamingLinks = computed(() =>
  Object.values(props.album?.streamingLinks ?? {}).some(Boolean),
)

const releaseLabel = computed(() => {
  const album = props.album
  if (!album) {
    return 'Single'
  }

  if (!album.releaseDate) {
    return `Single | ${album.year}`
  }

  const date = new Date(album.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `Single | ${album.releaseDate}`
  }

  return `Single | ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
})

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !panelRef.value) {
    return
  }

  const focusables = panelRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
  const ordered = [...focusables].filter((element) => element.offsetParent !== null)

  if (!ordered.length) {
    event.preventDefault()
    return
  }

  const first = ordered[0]
  const last = ordered[ordered.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.album) {
    return
  }

  if (event.key === 'Escape') {
    emit('close')
    return
  }

  trapFocus(event)
}

const onPanelPointerDown = (event: PointerEvent) => {
  swipeStartY = event.clientY
}

const onPanelPointerUp = (event: PointerEvent) => {
  const swipeDeltaY = event.clientY - swipeStartY

  if (window.matchMedia('(max-width: 767px)').matches && swipeDeltaY > 90) {
    emit('close')
  }
}

if (import.meta.client) {
  watch(() => props.album, (album) => {
    document.body.style.overflow = album ? 'hidden' : ''

    if (album) {
      previousActiveElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
      nextTick(() => closeButtonRef.value?.focus())
    }
    else {
      previousActiveElement.value?.focus()
    }
  }, { immediate: true })

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  })
}
</script>

<style scoped>
.single-modal-enter-active,
.single-modal-leave-active {
  transition:
    opacity 300ms var(--ease-standard),
    transform 300ms var(--ease-standard);
}

.single-modal-enter-from,
.single-modal-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}

@media (min-width: 768px) {
  .single-modal-enter-from,
  .single-modal-leave-to {
    transform: translateY(0) scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .single-modal-enter-active,
  .single-modal-leave-active {
    transition-duration: 1ms !important;
  }

  .single-modal-enter-from,
  .single-modal-leave-to {
    transform: none !important;
  }
}
</style>
