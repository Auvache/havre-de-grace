<template>
  <header :class="['space-y-3', alignClass]">
    <p v-if="eyebrow" class="label-text muted-text">
      {{ eyebrow }}
    </p>
    <h2 class="section-heading">
      {{ title }}
    </h2>
    <p v-if="description" class="muted-text max-w-2xl">
      {{ description }}
    </p>
    <slot />
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  align?: 'left' | 'center'
}>(), {
  eyebrow: undefined,
  description: undefined,
  align: 'left',
})

const alignClass = computed(() => props.align === 'center' ? 'text-center' : 'text-left')
</script>
