export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  app: {
    head: {
      title: 'Your Site Name',
      meta: [
        { name: 'description', content: 'Your site description' },
      ],
    },
  },
})