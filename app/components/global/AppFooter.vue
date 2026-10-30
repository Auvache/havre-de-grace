<!--
  The footer, centred: the stacked mark from the splash screen, every streaming
  and social service as its own icon, then the site's pages in two columns
  (the music on the left, the person on the right). The nav carries
  only records / about / contact, so this is where everything else is found.
  No signup (a page has one at most, and it's the page's own).

  `tone="dark"` for the album pages.
-->

<template>
  <footer :class="['site-footer', { 'is-dark': tone === 'dark' }]">
    <NuxtLink to="/" class="site-footer__mark" :aria-label="`${siteProfile.artistName}, home`">
      <BrandMark variant="lockup" decorative />
    </NuxtLink>

    <StreamingLinks :links="siteProfile.artistLinks" compact />

    <nav aria-label="Footer" class="site-footer__links">
      <div v-for="(column, index) in FOOTER_COLUMNS" :key="index" class="site-footer__col">
        <NuxtLink v-for="link in column" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
      </div>
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

// The music, then the person. /music-videos is left out: it stays built, but
// nothing visible links to it for now (2026-10-30).
const FOOTER_COLUMNS = [
  [
    { label: 'records', to: '/music' },
    { label: 'record player', to: '/listen' },
    { label: 'influences', to: '/influences' },
  ],
  [
    { label: 'about', to: '/about' },
    { label: 'letters', to: '/letters' },
    { label: 'press kit', to: '/press' },
    { label: 'contact', to: '/contact' },
  ],
]
</script>

<style scoped>
.site-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 72px 24px 64px;
  border-top: var(--line);
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

.site-footer__mark {
  width: 9rem;
  color: var(--theme-text);
}

.site-footer.is-dark .site-footer__mark {
  color: #e8e6df;
}

.site-footer__links {
  display: grid;
  /* Two even columns, each as wide as the widest link, centred as a pair. */
  width: max-content;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* The right-hand column sits flush right, so the pair frames the middle. */
.site-footer__col + .site-footer__col {
  align-items: flex-end;
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
    gap: 32px;
    padding: 56px 20px 40px;
  }

  .site-footer__mark {
    width: 7.5rem;
  }

  .site-footer__links {
    gap: 48px;
  }
}
</style>
