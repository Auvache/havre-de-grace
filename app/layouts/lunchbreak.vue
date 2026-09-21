<!--
  The Lunch Break Records layout.

  Same chrome as the rest of the site — the nav, the mailing-list banner, the
  Havre De Grace footer — with a section footer of its own above it carrying
  the wordmark, the "this is not a label" blurb and the byline back to the
  music.

  The section's shared CSS lives here rather than in app/assets/css, on
  purpose. Only these pages use this layout, so the prose and print rules ship
  with the layout chunk instead of on every page of the site, and the whole
  sub-brand stays inside three directories that can be lifted out together.
-->

<template>
  <div class="banner-offset min-h-screen text-[var(--theme-text)]">
    <AppNavbar />

    <main class="min-h-[calc(100vh-var(--chrome-height))]">
      <slot />
    </main>

    <section class="lb-colophon" aria-labelledby="lb-colophon-heading">
      <div class="page-container py-12">
        <div class="mx-auto max-w-3xl space-y-5 text-center">
          <NuxtLink :to="LUNCH_BREAK.basePath" class="inline-block no-underline">
            <LbWordmark id="lb-colophon-heading" as="p" size="sm" />
          </NuxtLink>

          <p class="text-sm leading-relaxed muted-text">
            {{ LUNCH_BREAK.about.is }}
            <strong class="font-medium">{{ LUNCH_BREAK.about.isNot }}</strong>
          </p>

          <p class="text-sm muted-text">
            <NuxtLink :to="LUNCH_BREAK.byline.href" class="lb-colophon__byline">
              {{ LUNCH_BREAK.byline.text }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '~/components/global/AppFooter.vue'
import AppNavbar from '~/components/global/AppNavbar.vue'
import { LUNCH_BREAK } from '~~/shared/lunch-break/config'

usePageTheme()
</script>

<style scoped>
.lb-colophon {
  border-top: 1px solid var(--theme-border);
}

.lb-colophon__byline {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.lb-colophon__byline:hover {
  color: var(--color-accent);
}
</style>

<style>
/*
 * --- Article prose ---------------------------------------------------------
 *
 * Hand-rolled rather than @tailwindcss/typography: the site has no typography
 * plugin, adding one for four articles would be a dependency and a second set
 * of type opinions, and everything below is eight rules against the type scale
 * that already exists in main.css.
 */
.lb-prose {
  font-size: var(--font-size-body);
  line-height: 1.75;
}

.lb-prose > * + * {
  margin-top: 1.25em;
}

.lb-prose h2 {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.02em;
  line-height: 1.25;
  margin-top: 2.4em;
  /* Anchored from the article's contents list and from the funding legend, so
     a jump must clear the fixed header rather than landing behind it. */
  scroll-margin-top: calc(var(--chrome-height) + 1rem);
}

.lb-prose h3 {
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-top: 2em;
  scroll-margin-top: calc(var(--chrome-height) + 1rem);
}

.lb-prose h2 + *,
.lb-prose h3 + * {
  margin-top: 0.75em;
}

.lb-prose a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.lb-prose strong {
  font-weight: 500;
}

.lb-prose ul,
.lb-prose ol {
  padding-left: 1.4rem;
}

.lb-prose ul {
  list-style: disc;
}

.lb-prose ol {
  list-style: decimal;
}

.lb-prose li + li {
  margin-top: 0.5em;
}

.lb-prose li::marker {
  color: var(--theme-muted);
}

.lb-prose blockquote {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
  padding-left: 1rem;
  color: var(--theme-muted);
}

.lb-prose code {
  font-size: 0.9em;
  background: var(--theme-surface);
  border-radius: var(--radius-sm);
  padding: 0.1em 0.35em;
}

.lb-prose hr {
  border-color: var(--theme-border);
  margin-block: 2.5em;
}

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
  .lb-colophon,
  .mailing-banner,
  .lb-no-print {
    display: none !important;
  }

  main {
    min-height: 0 !important;
  }

  .section-space {
    padding-block: 0 !important;
  }

  .surface-card,
  .lb-box {
    background: transparent !important;
    border-color: #999 !important;
    box-shadow: none !important;
  }

  /* Print the destination of a real link; skip in-page anchors and the
     mailto, which are noise on paper. */
  .lb-print-urls a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.75em;
    word-break: break-all;
  }

  .lb-print-block {
    break-inside: avoid;
  }
}
</style>
