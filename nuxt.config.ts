const SITE_URL = 'https://havredegracemusic.com'
const SITE_DESCRIPTION = 'Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, based in Vancouver, Washington. Albums, lyrics, credits, and booking.'

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
    url: SITE_URL,
    name: 'Havre De Grace',
    description: SITE_DESCRIPTION,
    defaultLocale: 'en',
  },

  // Every JSON-LD node on the site goes through nuxt-schema-org's `useSchemaOrg`
  // so it all lands in a single @graph with cross-referenced @ids. The previous
  // setup hand-rolled <script type="application/ld+json"> blocks alongside this
  // module's output, which shipped two conflicting WebSite entities per page and
  // left MusicGroup as an unreferenced island.
  schemaOrg: {
    defaults: true,
  },

  // og:image dimensions are declared explicitly per page in usePageSeo; the
  // module's inferred 1200x630 default was wrong for square album artwork.
  ogImage: {
    enabled: false,
  },

  image: {
    // Pin the provider. It defaults to 'auto', which resolves via std-env's
    // detected provider — and Amplify sets AWS_APP_ID on every build, so a
    // build there autodetects 'awsAmplify' and rewrites every image URL to
    // /_amplify/image?url=... That endpoint only exists on a WEB_COMPUTE
    // deployment, served by the nitro aws-amplify preset's imageOptimization
    // handler. This site deploys as static (platform WEB), so those URLs 404
    // and nitro stops prerendering the 132 /_ipx/ routes the pages reference.
    // Same failure mode as NITRO_PRESET in amplify.yml: provider autodetection
    // assumes SSR on Amplify, and this site is deliberately not that.
    provider: 'ipx',
  },

  content: {
    // Back the build-time content DB with Node's built-in `node:sqlite`
    // instead of the better-sqlite3 native addon. A native addon is ABI-locked
    // to one Node major, so it has to be rebuilt whenever Node moves and it
    // couples the Node that installs node_modules to the Node that builds.
    // node:sqlite is unflagged from Node 24 on and has neither problem.
    experimental: {
      sqliteConnector: 'native',
    },
  },

  fonts: {
    families: [
      { name: 'Jost', provider: 'google' },
      { name: 'Patrick Hand', provider: 'google' },
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
        { name: 'description', content: SITE_DESCRIPTION },
        { property: 'og:site_name', content: 'Havre De Grace Music' },
      ],
    },
  },

  sitemap: {
    enabled: true,
    autoLastmod: true,
    // Image auto-discovery is off because it emitted broken URLs. It reads the
    // `src`/`srcset` attributes straight out of the prerendered HTML, where the
    // ampersand in a @nuxt/image URL ("/_ipx/f_webp,avif&s_1008x1008/...") is
    // already written as "&amp;", then XML-escapes that again — so the sitemap
    // shipped "&amp;amp;s_1008x1008" and every one of those image URLs 404s once
    // a crawler unescapes it. The entries were mostly noise anyway: streaming
    // service icons out of /_nuxt, and 50+ other artists' album covers from the
    // influences page. Album art is still discoverable from the pages
    // themselves and from the MusicAlbum schema's `image`.
    discoverImages: false,
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
      siteUrl: SITE_URL,
    },
  },

  routeRules: {
    '/press': {
      redirect: {
        to: '/about',
        statusCode: 301,
      },
    },
    // The discography now lives as a section on the homepage.
    '/music': {
      redirect: {
        to: '/#music',
        statusCode: 301,
      },
    },
    // Contact is now a section on the homepage.
    '/contact': {
      redirect: {
        to: '/#contact',
        statusCode: 301,
      },
    },
    // The grid version of the influences page was built at /influences-new and
    // has now replaced the pannable canvas at /influences. The staging URL was
    // live long enough to be crawled and listed in the sitemap, so it redirects
    // rather than 404s.
    '/influences-new': {
      redirect: {
        to: '/influences',
        statusCode: 301,
      },
    },
    // --- Deliberately kept out of the index ---
    // Each of these renders too little server-side text to earn a place in
    // search, and each would compete with a stronger page for the same query.
    // "follow" is kept so crawlers still pass signal through to the pages that
    // should rank. A noindex route rule also drops the URL from the sitemap.
    //
    // Link-in-bio hub, linked from Instagram/YouTube/Bandcamp profiles. Its job
    // is click-through, not search; indexing it risks outranking the homepage
    // for brand queries.
    '/links': {
      robots: 'noindex, follow',
    },
    // The record player is a locked, full-viewport scene with no server-rendered
    // copy (see record-player.css: height 100dvh / overflow hidden). The
    // "digital vinyl" angle is targeted from the album pages instead, which have
    // the body text to actually rank for it.
    '/listen': {
      robots: 'noindex, follow',
    },
    '/listen/**': {
      robots: 'noindex, follow',
    },
    // The influences canvas is client-rendered, so crawlers see an empty page.
    '/influences': {
      robots: 'noindex, follow',
    },
  },

  nitro: {
    prerender: {
      // Song pages under /music/<album>/<song> are discovered by crawling the
      // album tracklists, so they don't need listing here.
      routes: [
        '/',
        '/about',
        '/links',
        '/influences',
        '/listen',
        '/music/i-want-to-be-yours-and-other-songs',
        '/music/into-the-wild',
        '/listen/i-want-to-be-yours-and-other-songs',
        '/listen/into-the-wild',
      ],
    },
  },
})
