<!--
  One line: the name and the place, then text links to where the music lives
  and to the letters. No coloured platform icons, no signup (a page has one at
  most, and it's the page's own).

  `tone="dark"` for the album pages.
-->

<template>
  <footer :class="['site-footer', { 'is-dark': tone === 'dark' }]">
    <span>{{ siteProfile.artistName }} · {{ siteProfile.location }}</span>
    <nav aria-label="Elsewhere" class="site-footer__links">
      <a v-for="link in links" :key="link.label" :href="link.href" rel="noopener">{{ link.label }}</a>
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
const { spotify, appleMusic, bandcamp, youtube, instagram } = siteProfile.artistLinks

const links = [
  { label: 'spotify', href: spotify },
  { label: 'apple music', href: appleMusic },
  { label: 'bandcamp', href: bandcamp },
  { label: 'youtube', href: youtube },
  { label: 'instagram', href: instagram },
].filter((link): link is { label: string; href: string } => Boolean(link.href))
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

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 26px;
}

.site-footer__links a {
  text-decoration: none;
}

.site-footer__links a:hover {
  color: var(--theme-text);
}

@media (max-width: 640px) {
  .site-footer {
    flex-direction: column;
    align-items: flex-start;
    padding: 40px 20px 30px;
  }
}
</style>
