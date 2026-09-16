<template>
  <header :class="['space-y-3', alignClass]">
    <component :is="headingTag" class="section-heading">
      {{ title }}
    </component>
    <p v-if="description" :class="['muted-text max-w-2xl', descriptionClass]">
      {{ description }}
    </p>
    <slot />
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  align?: 'left' | 'center'
  headingTag?: string
}>(), {
  description: undefined,
  align: 'left',
  headingTag: 'h2',
})

const alignClass = computed(() => props.align === 'center' ? 'text-center' : 'text-left')
const descriptionClass = computed(() => props.align === 'center' ? 'mx-auto' : '')
const headingTag = computed(() => props.headingTag)
</script>
