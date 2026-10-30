<!--
  The footer, centred: it opens with the anchor break (RuleBreak), the one
  place the anchor marks a line, so it always means the end of the page. Then
  every streaming and social service as its own icon, and the site's pages in
  two columns of three (the music on the left, the person on the right). The nav carries
  only records / about / contact, so this is where everything else is found.
  No signup (a page has one at most, and it's the page's own).

  `tone="dark"` for the album pages.
-->

<template>
  <footer :class="['site-footer', { 'is-dark': tone === 'dark' }]">
    <RuleBreak mark="anchor" class="site-footer__rule" />

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

// The music, then the person. /music-videos and /influences are left out:
// they stay built, but nothing visible links to them for now (2026-10-30).
const FOOTER_COLUMNS = [
  [
    { label: 'records', to: '/music' },
    { label: 'record player', to: '/listen' },
    { label: 'letters', to: '/letters' },
  ],
  [
    { label: 'about', to: '/about' },
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
  padding: 0 24px 64px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: lowercase;
  color: #7a838c;
  background: var(--theme-bg);
}

.site-footer.is-dark {
  --line-ink: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
}

/* Edge to edge, across the footer's own padding. */
.site-footer__rule {
  align-self: stretch;
  margin: 0 -24px 6px;
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
    padding: 0 20px 40px;
  }

  .site-footer__rule {
    margin: 0 -20px 0;
  }

  .site-footer__links {
    gap: 48px;
  }
}
</style>
