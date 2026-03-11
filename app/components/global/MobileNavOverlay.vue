<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        id="mobile-nav-overlay"
        class="fixed inset-0 z-[60] bg-black/55 px-4 py-5 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <Transition name="overlay-panel" appear>
          <div class="surface-card mx-auto flex h-full max-w-2xl flex-col justify-between p-8">
            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-theme text-2xl leading-none"
                aria-label="Close navigation menu"
                @click="$emit('close')"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <nav aria-label="Mobile" class="py-6">
              <ul class="space-y-5 text-center text-3xl font-medium lowercase">
                <li v-for="link in links" :key="link.to">
                  <NuxtLink :to="link.to" class="nav-link inline-block" @click="$emit('close')">
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <p class="text-center text-sm muted-text">
              {{ artistName }}
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface NavLinkItem {
  label: string
  to: string
}

const props = withDefaults(defineProps<{
  open: boolean
  links: NavLinkItem[]
  artistName: string
}>(), {
  open: false,
})

const emit = defineEmits<{
  close: []
}>()

if (import.meta.client) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.open) {
      emit('close')
    }
  }

  watch(
    () => props.open,
    (isOpen) => {
      document.body.style.overflow = isOpen ? 'hidden' : ''
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeyDown)
  })
}
</script>
