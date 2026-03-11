<template>
  <nav
    v-if="sections.length"
    class="sticky top-[var(--nav-height)] z-40 border-y border-theme bg-[color-mix(in_srgb,var(--theme-bg)_90%,transparent)] supports-[backdrop-filter]:backdrop-blur"
    aria-label="Album sections"
  >
    <ul class="page-container flex items-center gap-2 overflow-x-auto py-3 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <template v-for="(section, index) in sections" :key="section.id">
        <li>
          <button
            type="button"
            class="nav-link whitespace-nowrap px-1 py-1 transition-colors duration-200"
            :data-active="section.id === activeSectionId"
            :class="section.id === activeSectionId ? 'text-[var(--color-accent)]' : 'muted-text hover:text-[var(--theme-text)]'"
            @click="$emit('navigate', section.id)"
          >
            {{ section.label }}
          </button>
        </li>
        <li v-if="index < sections.length - 1" class="muted-text" aria-hidden="true">|</li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface ScrollSection {
  id: string
  label: string
}

defineProps<{
  sections: ScrollSection[]
  activeSectionId: string
}>()

defineEmits<{
  navigate: [sectionId: string]
}>()
</script>
