export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: 'app/',

  ssr: true,

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
  ],

  site: {
    url: 'https://havredegracemusic.com',
    name: 'Havre De Grace',
    description: 'Official website of Havre De Grace - Independent singer-songwriter music',
    defaultLocale: 'en',
  },

  fonts: {
    families: [
      { name: 'Jost', provider: 'google' },
    ],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Havre De Grace',
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: 'Official website of Havre De Grace - Independent singer-songwriter music from Vancouver, WA' },
        { property: 'og:site_name', content: 'Havre De Grace Music' },
        { property: 'og:title', content: 'Havre De Grace' },
        { property: 'og:description', content: 'Official website of Havre De Grace - Independent singer-songwriter music' },
        { property: 'og:url', content: 'https://havredegracemusic.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://havredegracemusic.com/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Havre De Grace' },
        { name: 'twitter:description', content: 'Independent singer-songwriter music' },
        { name: 'twitter:image', content: 'https://havredegracemusic.com/og-image.jpg' }
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://havredegracemusic.com',
    },
  },

  nitro: {
    prerender: {
      routes: ['/', '/music', '/music/i-want-to-be-yours-and-other-songs', '/about', '/contact'],
    },
  },
})
