<template>
  <figure
    ref="host"
    class="overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black/5"
    :style="{ aspectRatio: ratio }"
  >
    <!--
      The sheet is fetched and inlined rather than dropped into an <img>.
      An SVG loaded as an image is isolated: it cannot reach the page's fonts,
      so every sheet would come up in Helvetica and the whole point of a type
      reference would be lost. Inlined, it takes the site's Jost like anything
      else on the page.
    -->
    <div v-if="markup" class="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full" v-html="markup" />
    <div v-else-if="failed" class="flex h-full items-center justify-center p-6 text-center text-sm muted-text">
      Could not load {{ src }}
    </div>
    <div v-else class="h-full w-full animate-pulse bg-[color:var(--theme-surface)]" />
  </figure>
</template>

<script setup lang="ts">
/*
 * One generated style sheet, loaded when it comes near the viewport.
 *
 * The sheets run to hundreds of kilobytes of markup between them. Shipped in the bundle it would
 * be that much string to parse before anything painted; fetched on
 * intersection it is markup nobody downloads unless they scroll to it, and
 * the files gzip to a fraction of that because they are almost entirely
 * repeated attributes.
 */
const props = withDefaults(defineProps<{
  src: string
  /** Sheets are 1600x1260; the shared end card is its own shape. */
  ratio?: string
}>(), { ratio: '1600 / 1260' })

const host = useTemplateRef<HTMLElement>('host')
const markup = ref('')
const failed = ref(false)

const load = async () => {
  if (markup.value || failed.value) return
  try {
    const response = await fetch(props.src)
    if (!response.ok) throw new Error(String(response.status))
    markup.value = await response.text()
  }
  catch {
    failed.value = true
  }
}

onMounted(() => {
  const element = host.value
  if (!element) return
  // No IntersectionObserver is not worth a polyfill on an unlisted page; just load.
  if (typeof IntersectionObserver === 'undefined') {
    void load()
    return
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    observer.disconnect()
    void load()
  }, { rootMargin: '600px' })
  observer.observe(element)
  onBeforeUnmount(() => observer.disconnect())
})
</script>
