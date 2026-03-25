export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: 'app/',
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

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

  css: [
    '~/assets/css/main.css',
    '~/assets/css/themes.css',
    '~/assets/css/transitions.css',
  ],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
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
      ],
    },
  },

  sitemap: {
    enabled: true,
    autoLastmod: true,
  },

  robots: {
    enabled: true,
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: ['/sitemap.xml'],
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://havredegracemusic.com',
    },
  },

  routeRules: {
    '/press': {
      redirect: {
        to: '/about',
        statusCode: 301,
      },
    },
  },

  nitro: {
    prerender: {
      routes: ['/', '/music', '/music/i-want-to-be-yours-and-other-songs', '/music/into-the-wild', '/about', '/contact', '/links'],
    },
  },
})

