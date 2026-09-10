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

## Agent-discovery headers

`customHttp.json` also carries the `Link` headers that advertise the site to
agents (RFC 8288), and the `Content-Type` for the artefacts
`modules/agent-discovery.ts` generates. JSON has no comment syntax and Amplify
validates the file against a schema, so the reasoning lives here.

### Why the patterns are spelled out

Amplify matches `customHeaders` patterns against the **request** path, not the
key it resolves to on S3. A request for the homepage is `/`, not
`/index.html`, and a request for the about page is `/about`. So `**/*.html`
matches neither — it covers `/404.html` and `/200.html` and essentially nothing
a visitor or a crawler ever asks for. That gap is pre-existing, and is likely
why the HTML `Cache-Control` rule has never actually applied to a page view.

Whether Amplify matches the incoming request path or the key it rewrites to is
not something the local build can prove either way, so the `Link` rules are
declared under **both** spellings — `/` and `/index.html`, `/about` and
`/about/index.html`. A given request matches only one of each pair, so the
header cannot double up, and it fires whichever way Amplify resolves it.
`/music/**` needs no alias: `**` spans path separators, so it already covers
both `/music/into-the-wild` and `/music/into-the-wild/index.html`.

Confirm with the `curl -sI` check below after the first deploy; if the homepage
returns no `Link` header, matching is happening on a form neither pattern
covers and this is the place to fix it.

### Which relations are set, and which are deliberately not

| rel | Target | Why |
| --- | --- | --- |
| `index` | `/llms.txt` | The llmstxt.org index of every page. |
| `describedby` | `/.well-known/ai-catalog.json` | ARD capability manifest. |
| `related` | `/discography.json` | The catalogue as structured data. |
| `sitemap` | `/sitemap.xml` | Already existed, now discoverable from a header. |
| `author` | `/about` | The page about the person. |
| `alternate` | `<page>.md` | Only on `/` and `/about`; see below. |

Not set, on purpose: `api-catalog`, `service-desc`, `service-doc`, and anything
under `/.well-known/oauth-*`. This is a static bundle with no API, no login and
no MCP server. An audit tool scores the presence of those headers, but a `Link`
header pointing at an OpenAPI document that does not exist only costs an agent a
round trip to a 404 to find out it was misled — it is worse than the missing
header it replaces.

### Why the markdown alternate is mostly *not* here

The `.md` mirror differs per URL and a glob cannot express that, so the
alternate ships as `<link rel="alternate" type="text/markdown">` in each page's
head (see `app/composables/usePageSeo.ts`), which is per-page accurate. `/` and
`/about` get one in the header too, since those are the pages an agent lands on
first and a header is cheaper for it to read than the HTML.

Note this is *not* content negotiation. The canonical "Markdown for Agents"
behaviour is an origin that returns markdown when the request carries
`Accept: text/markdown`. A static bundle on S3 serves one body per key and
cannot do that. Serving the markdown at its own advertised URL is the static
equivalent, and short of moving the site behind a compute layer it is as far as
this can go.

### Content types

S3 has no mapping for `.md`, so without the explicit `Content-Type` the mirrors
go out as `binary/octet-stream` and browsers download them instead of
displaying them. `/llms.txt` is markdown by convention despite the extension.
`/.well-known/ai-catalog.json` needs `Access-Control-Allow-Origin: *` because
the ARD spec expects a registry to be able to fetch it from a browser.

## Verifying the agent surface after deploy

```bash
# Link header on the homepage.
curl -sI https://havredegracemusic.com/ | grep -i '^link:'

# Markdown mirrors served as markdown, not as a download.
curl -sI https://havredegracemusic.com/index.md | grep -i '^content-type:'
curl -sI https://havredegracemusic.com/llms.txt | grep -i '^content-type:'

# Content Signals.
curl -s https://havredegracemusic.com/robots.txt | grep -i '^content-signal:'

# Manifest, readable cross-origin.
curl -sI https://havredegracemusic.com/.well-known/ai-catalog.json \
  | grep -iE '^(content-type|access-control-allow-origin):'

# Every mirror advertised in llms.txt should resolve.
curl -s https://havredegracemusic.com/llms.txt \
  | grep -oE 'https://[^)]+\.md' \
  | while read -r u; do printf '%s %s\n' "$(curl -so /dev/null -w '%{http_code}' "$u")" "$u"; done
```
