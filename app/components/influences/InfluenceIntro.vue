<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-[clamp(1rem,5vw,2rem)] py-[clamp(1rem,5vh,3rem)] backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="influence-intro-lead"
        @click.self="emit('dismiss')"
      >
        <Transition name="influence-intro" appear>
          <article
            v-if="open"
            ref="panelRef"
            class="max-h-full w-[min(34rem,100%)] overflow-y-auto rounded-[var(--radius-lg)] border border-white/10 bg-[color:var(--color-bg-dark)] px-[clamp(1.5rem,5vw,2.5rem)] py-[clamp(1.75rem,5vw,2.5rem)] text-center text-[var(--color-text-dark)] shadow-[0_30px_60px_rgb(0_0_0_/_0.42)]"
          >
            <p
              id="influence-intro-lead"
              class="text-[length:var(--font-size-subheading)] font-[450] leading-tight"
            >
              I love music and music loves me.
            </p>

            <p class="mt-5 text-[length:var(--font-size-body)] font-[350] leading-[1.65] text-[var(--color-text-dark)]/92">
              Though the modern musical ecosystem thrives on singles and curated playlists, few
              things impress me more than a cohesive album that captures my attention from start to
              finish.
            </p>

            <p class="mt-5 text-[length:var(--font-size-body)] font-[350] leading-[1.65] text-[var(--color-text-dark)]/92">
              Each of these albums have impacted me in some way.
            </p>

            <p class="mt-5 text-[length:var(--font-size-body)] font-[350] leading-[1.65] text-[var(--color-muted-dark)]">
              Scroll around/click to explore how these albums have influenced me.
            </p>

            <button
              ref="dismissButtonRef"
              type="button"
              class="cta-solo mt-8 inline-flex rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
              @click="emit('dismiss')"
            >
              Start exploring
            </button>
          </article>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const dismissButtonRef = ref<HTMLButtonElement | null>(null)

// The wall behind this is a scroll container that owns both axes, so keys and
// wheel would pan it while the intro is up. Swallowing Escape here also stops
// it reaching InfluenceModal, which is not open yet anyway.
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
    if (event.key !== 'Escape' && document.activeElement === dismissButtonRef.value) {
      return
    }
    event.preventDefault()
    emit('dismiss')
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  // Only the dismiss button is focusable, so the trap is just "stay here".
  event.preventDefault()
  dismissButtonRef.value?.focus()
}

if (import.meta.client) {
  watch(() => props.open, (open) => {
    if (open) {
      nextTick(() => dismissButtonRef.value?.focus())
    }
  }, { immediate: true })

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
</script>

<style scoped>
.influence-intro-enter-active,
.influence-intro-leave-active {
  transition:
    opacity 320ms var(--ease-standard),
    transform 320ms var(--ease-standard);
}

.influence-intro-enter-from,
.influence-intro-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .influence-intro-enter-active,
  .influence-intro-leave-active {
    transition-duration: 1ms !important;
  }

  .influence-intro-enter-from,
  .influence-intro-leave-to {
    transform: none !important;
  }
}
</style>
