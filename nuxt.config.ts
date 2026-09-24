import { resourcesRoutes } from './shared/data/resources'

const SITE_URL = 'https://havredegracemusic.com'
const SITE_DESCRIPTION = 'Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, based in Vancouver, Washington. Albums, lyrics, credits, and booking.'

// Legacy /listen URLs, redirected to the single record-player scene.
//
// Spelled out rather than globbed, for two separate reasons.
//
// A glob never worked here on a static host. `nuxt generate` prerenders a route
// rule by visiting its pattern literally, so `/listen/*` wrote its redirect
// document to a directory named `*` on disk. S3 serves that only for a request
// containing a literal asterisk, so every one of these URLs was 404ing anyway.
//
// The worse failure was `/listen/_payload.json`. Route rules run as h3
// middleware, ahead of the renderer, so `/listen/*` also matched the extracted
// payload nitro emits beside the prerendered page — and replaced it with a
// meta-refresh redirect document. On the live site hydration then fetched HTML
// where it expected JSON, `useAsyncData('listen-albums')` resolved to
// undefined, and the rack of records that SSR had rendered was wiped the moment
// the page hydrated. Dev never showed it: payload extraction only happens on a
// static build.
//
// `/listen/**` is not a way out either — the double wildcard matches `/listen`
// itself and redirects the page to itself in a loop.
const LEGACY_LISTEN_ROUTES = Object.fromEntries(
  [
    'into-the-wild',
    'into-the-wild/andalusia',
    'into-the-wild/conman',
    'into-the-wild/ghost',
    'into-the-wild/goodbye-norma-jeane',
    'into-the-wild/into-the-wild',
    'into-the-wild/ivory',
    'into-the-wild/meet-me-at-the-horizon',
    'into-the-wild/new-york',
    'into-the-wild/rocks-in-the-sea',
    'into-the-wild/ship-to-stockholm',
    'i-want-to-be-yours-and-other-songs',
    'i-want-to-be-yours-and-other-songs/demolition-woman-live',
    'i-want-to-be-yours-and-other-songs/i-want-to-be-yours',
    'i-want-to-be-yours-and-other-songs/i-want-to-be-yours-demo-version',
    'i-want-to-be-yours-and-other-songs/jesus-creek',
    'i-want-to-be-yours-and-other-songs/scarecrow',
    'i-want-to-be-yours-and-other-songs/shades-of-blue-and-red',
    'i-want-to-be-yours-and-other-songs/sky-blue',
    'i-want-to-be-yours-and-other-songs/song-for-the-sick',
    'i-want-to-be-yours-and-other-songs/white-raven-live',
  ].map((path) => [`/listen/${path}`, { redirect: { to: '/listen', statusCode: 301 } }]),
)

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

  // Every page shares one card, declared with its real dimensions in
  // usePageSeo; the module stamped its own inferred values on top of that.
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
      // Exactly 400 and 700, and the pair matters.
      //
      // Left to itself the module emits one @font-face per family at weight
      // 400, so every `font-weight` in the stylesheets — 350 on the display
      // heading, 450 on section headings, 500 on labels — has been matching
      // that one file and rendering at 400. The music video at
      // /music-videos needs a real bold, and a family with no bold in it
      // does not get synthesised: the browser matches the 400 face and draws
      // 400.
      //
      // Adding 700 alone would have changed the rest of the site, because CSS
      // font matching sends a request for 500 *up* to the next available weight
      // when nothing at 500 exists. Declaring 400 as well keeps 350, 450 and
      // 500 resolving to the 400 file exactly as they do today, so this adds a
      // bold for one page and changes nothing anywhere else.
      { name: 'Jost', provider: 'google', weights: [400, 700] },
      { name: 'Patrick Hand', provider: 'google' },
      // The homepage hero's title: the cover's thin, widely-tracked caps.
      { name: 'Barlow Condensed', provider: 'google', weights: [200] },
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
        // SVG first, for browsers that support it; the .ico is the fallback.
        // Both are the same opaque tile, so the mark reads the same whatever
        // colour the tab strip is.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
      // Whether the mailing-list banner shows is a per-visitor fact, and every
      // page here is prerendered to one shared HTML file — so the banner ships
      // in the markup for everybody and this takes it back out again for the
      // people who have already subscribed or closed it.
      //
      // It has to be an inline script in <head> rather than anything Vue does:
      // hydration runs long after first paint, so a Vue-side check would show
      // the banner to everyone for a beat and then yank it, shoving the page up
      // by its height. See the `data-banner` rules in main.css, and
      // useMailingListBanner for the writer.
      script: [
        {
          key: 'mailing-list-banner',
          tagPosition: 'head',
          innerHTML: `try{if(/(?:^|;\\s*)hdg-mailing-list=/.test(document.cookie))document.documentElement.setAttribute('data-banner','hidden')}catch(e){}`,
        },
      ],
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
        // Content Signals (contentsignals.org). A usage preference expressed to
        // crawlers, separate from the access permission `allow` grants — the
        // point of the spec is that being allowed to fetch a page is not
        // permission to do anything you like with it.
        //
        //   search=yes    normal indexing, so the site still ranks.
        //   ai-input=no   not to be retrieved and summarised into a chatbot
        //                 answer at query time.
        //   ai-train=no   the lyrics and bio are not training corpus.
        //
        // Unenforceable against a crawler that ignores it, and deliberately so:
        // it is a declaration of terms, which is what makes ignoring it a
        // documented choice rather than an ambiguity.
        contentSignal: ['ai-train=no, search=yes, ai-input=no'],
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
    // The discography now lives as a section on the homepage.
    '/music': {
      redirect: {
        to: '/#music',
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
    // The record player used to be one route per album (/listen/<album>) plus
    // one per track. It's now a single scene with the records on the page, but
    // those URLs were live and passed around, so they redirect rather than 404.
    // Built from LEGACY_LISTEN_ROUTES above — see the note there for why every
    // path is spelled out instead of globbed.
    ...LEGACY_LISTEN_ROUTES,

    // The influences canvas is client-rendered, so crawlers see an empty page.
    '/influences': {
      robots: 'noindex, follow',
    },
    // The exit door for the mailing list. /subscribe is a real landing page and
    // stays indexable; this one is three paragraphs of housekeeping that only
    // matter to someone already on the list, and it has nothing to win a query
    // with. "follow" so it still passes signal back to the pages that do.
    '/unsubscribe': {
      robots: 'noindex, follow',
    },
    // Work in progress: a review page of candidate logo marks, shared by link
    // rather than navigated to. Nothing here should compete in search.
    '/logo': {
      robots: 'noindex, nofollow',
    },
    // The music-video workbench: the style suite, the song pages, and the
    // kinetic-typography cut of "Andalusia". Shared by link for a decision, and
    // every page under here restates a published song's entire lyric — so
    // `nofollow` as well as `noindex`, like the /music/itw-* mockups. Covered
    // as a subtree so a new song's page arrives noindexed rather than
    // remembering to add a rule for it.
    '/music-videos/**': {
      robots: 'noindex, nofollow',
    },
    // --- Unlisted ---
    // The private workbench. Not in the navigation, not in the sitemap (a
    // noindex rule drops the URL from it), not in the markdown mirrors or
    // llms.txt (EXCLUDED_ROUTES in modules/agent-discovery.ts), and linked from
    // nowhere. Typing the URL is the only way in.
    //
    // `nofollow` as well as `noindex`, unlike /links and /listen: those two are
    // kept crawlable so they pass signal on to the pages that should rank,
    // whereas nothing under here should hand a crawler anything at all.
    //
    // Deliberately absent from the `robots` groups above: a `Disallow: /tools`
    // line would publish the path to everyone who reads robots.txt, which is
    // the opposite of what an unlisted page is for. The files themselves —
    // playlists.json and the audio, which no meta tag can reach — are covered
    // by the X-Robots-Tag header on /demos/** in public/customHttp.json.
    //
    // Unlisted is not private. This is a static bundle on S3; there is nothing
    // to authenticate against, so the URL is the only thing keeping anyone out.
    '/tools': {
      robots: 'noindex, nofollow',
    },
    '/tools/**': {
      robots: 'noindex, nofollow',
    },
  },

  nitro: {
    prerender: {
      // Song pages under /music/<album>/<song> are discovered by crawling the
      // album tracklists, so they don't need listing here.
      routes: [
        '/',
        '/about',
        '/press',
        '/contact',
        '/subscribe',
        '/unsubscribe',
        '/links',
        '/logo',
        '/influences',
        // Unlisted, but still has to exist as a document: a static host serves
        // keys, so a route that was never prerendered 404s however private it
        // is. Every page added under app/pages/tools/ needs a line here.
        '/tools',
        '/tools/demos',
        '/listen',
        // Unlisted and noindexed by the route rule above, but a static host
        // serves keys — a route that was never prerendered 404s however
        // private it is, and nothing links to these, so nothing crawls to them
        // either. Every page added under app/pages/music-videos/ needs a line
        // here.
        '/music-videos/styles',
        '/music-videos/andalusia',
        '/music-videos/kinetic',
        '/music-videos/into-the-wild',
        '/music-videos/conman',
        '/music-videos/goodbye-norma-jeane',
        '/music-videos/ivory',
        '/music-videos/new-york',
        '/music-videos/ship-to-stockholm',
        '/music-videos/into-the-wild-styles',
        '/music-videos/album',
        '/music/i-want-to-be-yours-and-other-songs',
        '/music/into-the-wild',
        // The /resources hub and its tools. Built from
        // shared/data/resources.ts so a new tool cannot be added without its
        // route existing — a static host serves keys, and a route that was
        // never prerendered 404s however correct the page component is.
        ...resourcesRoutes(),
      ],
    },
  },
})
