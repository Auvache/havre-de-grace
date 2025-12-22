export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  css: ['/assets/styles/main.css'],

  app: {
    head: {
      title: 'Havre De Grace',
      meta: [
        { name: 'description', content: 'Official website of Havre De Grace - Original music' },
        { property: 'og:title', content: 'Havre De Grace' },
        { property: 'og:description', content: 'Official website of Havre De Grace - Original music' },
        { property: 'og:url', content: 'https://havredegracemusic.com' },
        { property: 'og:type', content: 'website' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://havredegracemusic.com',
    },
  },
})