<template>
  <button
    type="button"
    class="share-link"
    :aria-label="`Copy a link to ${title}`"
    @click.stop="onClick"
  >
    <svg
      v-if="state === 'idle'"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
    <svg
      v-else-if="state === 'copied'"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>

    <span class="share-label">{{ labelText }}</span>

    <!-- The clipboard is refused outright in some embedded browsers, so the
         fallback is to put the URL on screen and let it be copied by hand
         rather than to claim a copy that never happened. -->
    <span v-if="state === 'failed'" class="share-fallback">{{ url }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** The track's share URL, already absolute. */
  url: string
  /** Track title, used for the accessible label only. */
  title: string
  /** Resting label. Some designs want the icon alone. */
  label?: string
}>(), {
  label: 'Copy link',
})

type State = 'idle' | 'copied' | 'failed'
const state = ref<State>('idle')

const labelText = computed(() => {
  if (state.value === 'copied') return 'Copied'
  if (state.value === 'failed') return 'Copy this:'
  return props.label
})

let resetTimer: ReturnType<typeof setTimeout> | null = null

async function onClick() {
  if (resetTimer) clearTimeout(resetTimer)

  try {
    await navigator.clipboard.writeText(props.url)
    state.value = 'copied'
    resetTimer = setTimeout(() => { state.value = 'idle' }, 1800)
  }
  catch {
    // Left up until dismissed — there is a URL to read and select in it.
    state.value = 'failed'
  }
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<style scoped>
.share-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: var(--share-padding, 0.3rem 0.6rem);
  border: 1px solid var(--share-border, transparent);
  border-radius: 999px;
  color: var(--share-color, var(--theme-muted));
  font-size: var(--share-font-size, 0.72rem);
  letter-spacing: 0.06em;
  white-space: nowrap;
  transition:
    color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}

.share-link:hover {
  color: var(--share-color-hover, var(--color-accent));
  border-color: var(--share-border-hover, var(--share-border, transparent));
}

.share-link svg {
  width: var(--share-icon-size, 0.95rem);
  height: var(--share-icon-size, 0.95rem);
  flex-shrink: 0;
}

.share-fallback {
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: all;
  font-size: 0.68rem;
  opacity: 0.8;
}
</style>
