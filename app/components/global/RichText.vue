<template>
  <span>
    <template v-for="(run, index) in runs" :key="index">
      <em v-if="run.emphasis">{{ run.text }}</em>
      <template v-else>{{ run.text }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import { toTextRuns } from '~~/shared/utils/emphasis'

const props = defineProps<{
  text?: string | null
}>()

const runs = computed(() => toTextRuns(props.text))
</script>
