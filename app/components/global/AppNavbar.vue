<template>
  <header
    :class="headerClass"
    :style="headerStyle"
  >
    <nav aria-label="Primary" class="page-container flex h-[var(--nav-height)] items-center justify-between">
      <NuxtLink
        v-if="!props.immersive"
        to="/"
        class="block leading-none"
        :aria-label="siteProfile.artistName"
      >
        <!--
          One mark at every width. Phones used to get the seal on its own
          (variant="sealSmall") on the grounds that the full lockup would crowd
          the menu button — it doesn't: the mark is 5.1:1, so the clamp's 9.5rem
          floor puts it at about 30px tall inside a 64px bar, and 9.5rem beside
          a 2.5rem button still clears the container padding on a 320px screen.
          Dropping the wordmark cost the brand its name in the one place every
          visitor looks, on the majority of the site's traffic.
        -->
        <BrandMark variant="navSeal" decorative class="w-[clamp(9.5rem,28vw,12.5rem)]" />
      </NuxtLink>
      <div v-else aria-hidden="true" />

      <ul class="hidden items-center gap-3 text-sm md:flex">
        <template v-for="(link, index) in navLinks" :key="link.to">
          <li>
            <NuxtLink
              :to="link.to"
              class="nav-link"
              :data-active="isActive(link.to)"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
          <li v-if="index < navLinks.length - 1" class="muted-text" aria-hidden="true">/</li>
        </template>
      </ul>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-theme md:hidden"
        :aria-expanded="mobileOpen ? 'true' : 'false'"
        aria-controls="mobile-nav-overlay"
        aria-label="Open navigation menu"
        @click="mobileOpen = true"
      >
        <span aria-hidden="true" class="block h-[2px] w-5 bg-current shadow-[0_6px_0_0_currentColor,0_-6px_0_0_currentColor]" />
      </button>
    </nav>

    <MobileNavOverlay
      :open="mobileOpen"
      :links="navLinks"
      :artist-name="siteProfile.artistName"
      @close="mobileOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark'
  immersive?: boolean
}>(), {
  theme: 'light',
  immersive: false,
})

const route = useRoute()
const siteProfile = useSiteProfile()
const { isSolid } = useNavScroll()

const mobileOpen = ref(false)

const navLinks = [
  { label: 'music', to: '/#music' },
  { label: 'listen', to: '/listen' },
  { label: 'about', to: '/about' },
  { label: 'contact', to: '/#contact' },
  // { label: 'influences', to: '/influences' },
]

const isActive = (to: string) => {
  // Hash links (music/contact) point at homepage sections; without real
  // scrollspy we can't tell which one is in view, so skip the underline
  // for them rather than showing it on both at once.
  if (to.includes('#')) {
    return false
  }

  return route.path === to || route.path.startsWith(`${to}/`)
}

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)

const headerClass = computed(() => [
  'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ease-in-out',
  (isSolid.value || mobileOpen.value) && !props.immersive ? 'supports-[backdrop-filter]:backdrop-blur-md' : '',
])

const headerStyle = computed(() => {
  if (props.immersive) {
    return {
      backgroundColor: '#000',
      borderBottomColor: 'transparent',
    }
  }

  if (isSolid.value || mobileOpen.value) {
    return {
      backgroundColor: 'color-mix(in srgb, var(--theme-bg) 92%, transparent)',
      borderBottomColor: 'var(--theme-border)',
    }
  }

  return {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  }
})
</script>
