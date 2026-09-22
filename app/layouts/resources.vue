<!--
  The /resources layout.

  Same chrome as the rest of the site. It exists only for the print rules
  below: the checklist and the directory are things people print and take away,
  and those rules ship with this layout chunk instead of on every page of the
  site.
-->

<template>
  <div class="banner-offset min-h-screen text-[var(--theme-text)]">
    <AppNavbar />

    <main class="min-h-[calc(100vh-var(--chrome-height))]">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '~/components/global/AppFooter.vue'
import AppNavbar from '~/components/global/AppNavbar.vue'

usePageTheme()
</script>

<style>
/*
 * --- Print -----------------------------------------------------------------
 *
 * The checklist and the directory are things people print and take away — the
 * checklist in particular is more useful on paper next to a laptop than in a
 * second tab. So: drop the chrome, drop anything interactive, flatten the
 * surfaces to something a laser printer will not turn into a grey block, and
 * let URLs show so a printed directory is still usable.
 */
@media print {
  :root {
    --banner-height: 0rem;
  }

  body {
    background: #fff !important;
    color: #000 !important;
  }

  header,
  footer,
  .mailing-banner,
  .rs-no-print {
    display: none !important;
  }

  main {
    min-height: 0 !important;
  }

  .section-space {
    padding-block: 0 !important;
  }

  .surface-card {
    background: transparent !important;
    border-color: #999 !important;
    box-shadow: none !important;
  }

  /* Print the destination of a real link; skip in-page anchors and the
     mailto, which are noise on paper. */
  .rs-print-urls a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.75em;
    word-break: break-all;
  }

  .rs-print-block {
    break-inside: avoid;
  }
}
</style>
