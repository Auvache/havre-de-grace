<template>
  <section class="page-container section-space border-t border-theme">
    <!--
      The mirror image of AboutPreview: same grid, same reveals, same heading
      and read-more pair, with the image column moved to the right so two
      identical rows don't sit back to back. `md:order-*` rather than a
      different column definition, so the image still stacks above the text on
      phones exactly as the about section does.
    -->
    <div class="grid gap-10 md:grid-cols-[1fr_minmax(0,504px)] md:items-center">
      <ScrollReveal
        as="div"
        variant="section-right"
        class-name="mx-auto w-full max-w-[504px] md:order-2"
        :delay-ms="90"
        :distance-px="84"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtLink
          to="/listen"
          class="interactive-lift block overflow-hidden rounded-[var(--radius-lg)]"
          aria-label="Open the Havre De Grace record player"
        >
          <NuxtImg
            src="/images/listen-record-player.png"
            alt="The Havre De Grace record player, with Into the Wild on the platter"
            class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_26px_54px_color-mix(in_srgb,var(--theme-text)_14%,transparent)]"
            width="1440"
            height="900"
            sizes="(max-width: 768px) 100vw, 504px"
            format="webp,avif"
            loading="lazy"
          />
        </NuxtLink>
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="space-y-6 md:order-1"
        variant="section-left"
        :delay-ms="180"
        :distance-px="84"
        :blur-px="6"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading title="listen" />

        <p class="max-w-2xl muted-text">
          The whole catalogue on a record player you can actually use — drop the
          needle anywhere, flip to side B, and read the lyrics and liner notes as
          the track plays.
        </p>

        <NuxtLink to="/listen" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
          open the record player
        </NuxtLink>
      </ScrollReveal>
    </div>
  </section>
</template>
