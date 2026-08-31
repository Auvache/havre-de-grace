# AWS Amplify redirect + header config

The site deploys as a static bundle (`.output/public`, nitro `static` preset).
Nitro can't emit real HTTP redirects into a static bundle, so the `redirect`
route rules in `nuxt.config.ts` are written out as `<meta http-equiv="refresh">`
HTML files instead:

```html
<!-- .output/public/music/index.html -->
<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/#music"></head></html>
```

Google follows a meta refresh and does eventually treat an instant one as a
permanent redirect, but it's a weaker, slower signal than a `301`: the crawler
has to fetch and render the page first, and link equity consolidation is not
guaranteed the way it is with a real status code. Amplify can serve true 301s,
so these should be configured there and the meta-refresh files treated as a
fallback.

## Redirects — paste into the Amplify console

**Amplify Console → your app → Hosting → Rewrites and redirects → Manage
redirects → Open text editor**, then paste:

```json
[
  {
    "source": "/music",
    "target": "/#music",
    "status": "301",
    "condition": null
  },
  {
    "source": "/contact",
    "target": "/#contact",
    "status": "301",
    "condition": null
  },
  {
    "source": "/press",
    "target": "/about",
    "status": "301",
    "condition": null
  },
  {
    "source": "/influences-new",
    "target": "/influences",
    "status": "301",
    "condition": null
  }
]
```

Keep this list in sync with the `redirect` entries in `nuxt.config.ts`'s
`routeRules` — that's the only other place these four paths are declared.

Note on the two hash targets: a `301` to `/#music` sends the browser to the
homepage and the fragment is applied client-side. Search engines drop the
fragment and treat both as redirects to `/`, which is the intent — those
sections live on the homepage now.

## Headers

Amplify reads a `customHttp.json` from the root of the deployed artifact.
`public/customHttp.json` is copied to `.output/public/customHttp.json` by the
build, so it ships automatically — no console step needed.

It currently sets long-lived immutable caching for the build-hashed assets under
`/_nuxt/` and the generated images under `/_ipx/`, both of which are
content-addressed, plus a short revalidating cache for HTML.

`noindex` is deliberately **not** handled here. It's applied as a `<meta
name="robots">` tag via the `robots` route rules in `nuxt.config.ts`, which has
two advantages: it works regardless of host configuration, and `@nuxtjs/sitemap`
reads the same rules and drops those URLs from `sitemap.xml`. An
`X-Robots-Tag` header set here would do neither. The previous
`X-Robots-Tag: noindex` route rule on `/music/into-the-wild` is a cautionary
example — it never reached the static bundle at all, so the page shipped with
`index, follow` in its HTML while still being excluded from the sitemap.

## Verifying after deploy

```bash
# Should each report 301 and the right Location.
for p in /music /contact /press /influences-new; do
  curl -sI "https://havredegracemusic.com$p" | head -3
done

# Should report noindex.
for p in /links /listen /influences; do
  curl -s "https://havredegracemusic.com$p" | grep -o '<meta name="robots"[^>]*>'
done
```
