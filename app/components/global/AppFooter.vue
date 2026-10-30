<!--
  One line: the name, then every streaming and social service as its own icon,
  then the letters. No signup (a page has one at most, and it's the page's own).

  `tone="dark"` for the album pages.
-->

<template>
  <footer :class="['site-footer', { 'is-dark': tone === 'dark' }]">
    <span class="site-footer__name">{{ siteProfile.artistName }}</span>
    <StreamingLinks :links="siteProfile.artistLinks" compact class="site-footer__icons" />
    <nav aria-label="Elsewhere" class="site-footer__links">
      <NuxtLink to="/letters">letters</NuxtLink>
    </nav>
  </footer>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'light' | 'dark'
}>(), {
  tone: 'light',
})

const siteProfile = useSiteProfile()
</script>

<style scoped>
.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 60px 56px 56px;
  border-top: 1px solid var(--rule);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: lowercase;
  color: #7a838c;
  background: var(--theme-bg);
}

.site-footer.is-dark {
  border-top-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
}

.site-footer__links a {
  text-decoration: none;
}

.site-footer__links a:hover {
  color: var(--theme-text);
}

.site-footer.is-dark .site-footer__links a:hover {
  color: #fff;
}

@media (max-width: 640px) {
  .site-footer {
    flex-direction: column;
    padding: 40px 20px 30px;
  }
}
</style>
