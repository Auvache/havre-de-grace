<template>
  <article class="surface-card flex flex-col overflow-hidden">
    <!--
      Assets in group d bake their own background in, so recolouring them for a
      dark stage would be meaningless. Those get one stage on a neutral ground
      instead of the light/dark pair.
    -->
    <div v-if="fixed" class="logo-stage logo-stage--neutral" v-html="svg" />
    <div v-else class="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
      <div class="logo-stage logo-stage--light" v-html="svg" />
      <div
        class="logo-stage logo-stage--dark"
        :class="wide ? 'sm:w-[22rem]' : 'sm:w-[13rem]'"
        v-html="svg"
      />
    </div>

    <div class="flex flex-1 flex-col gap-4 border-t border-theme p-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="max-w-md">
        <h3 class="text-[1.05rem] font-medium lowercase tracking-[0.01em]">
          {{ index }} · {{ name }}
        </h3>
        <p v-if="note" class="muted-text mt-1 text-[0.9rem] leading-relaxed">
          {{ note }}
        </p>
      </div>

      <div class="flex items-end gap-5">
        <!-- Small sizes are the honest test: a mark that survives 16px survives anything. -->
        <template v-if="!fixed">
          <div class="logo-scale" style="--size: 3rem" v-html="svg" />
          <div class="logo-scale" style="--size: 1.75rem" v-html="svg" />
          <div class="logo-scale" style="--size: 1rem" v-html="svg" />
        </template>
        <a
          :href="href"
          download
          class="label-text shrink-0 border-b border-[color:var(--color-accent)] pb-0.5 hover:opacity-70"
        >SVG</a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  svg: string
  index: string
  name: string
  note?: string
  href: string
  wide?: boolean
  fixed?: boolean
}>()
</script>

<style scoped>
.logo-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.75rem, 4vw, 3rem);
  min-height: 15rem;
}

.logo-stage--light {
  background: #ffffff;
}

.logo-stage--dark {
  background: #16191d;
}

/* A quiet chequerboard, so assets with their own background read as artwork
   rather than as a card that has lost its edges. */
.logo-stage--neutral {
  background:
    repeating-conic-gradient(#f1f2f3 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
}

.logo-stage :deep(svg) {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 11rem;
}

.logo-stage--dark :deep(svg) {
  color: #f4f6f7;
  max-height: 6rem;
}

.logo-stage--neutral :deep(svg) {
  max-height: 13rem;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
}

.logo-scale {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-scale :deep(svg) {
  height: var(--size);
  width: auto;
  max-width: calc(var(--size) * 6);
}
</style>
