# Logo generator

Source for the marks served at `/logo` and shipped as files under
`public/logos/`. Those SVGs are build output, not hand-edited artwork — change
the geometry here and regenerate:

```sh
node tools/logo/build.mjs            # the delivery suite
node tools/logo/build.mjs --archive  # …and the four earlier rounds
node tools/logo/rasterize.mjs        # the PNG/ICO the browser insists on
```

Only the suite ships. `/logo` is a style guide for the files actually in use,
so the rounds are kept here as generators and are not written into `public/`
unless you ask for them.

`rasterize.mjs` regenerates `favicon.ico`, `favicon.svg`, the touch and
home-screen icons, `og-image.png` and `brand-logo.png` in `public/`, all from
the suite SVGs, using headless Chrome as the renderer. Run it after any change
to `c4`, `c5`, `d2` or `a4`. The site itself inlines the suite SVGs
directly through `app/components/global/BrandMark.vue`, so nothing else needs
regenerating.

- `anchor.mjs` — the anchor in two weights, plus the scaffolding every
  composition needs. Both halves of every anchor come from one set of numbers,
  so the two sides cannot drift out of symmetry. `anchorSolid`'s `crownWeight`
  is the thickness of the crown crescent: round one draws it at 18, round two
  at the weight of the stock, which reads lighter.
- `lettering.mjs` — all-caps letterforms for the glyphs in "HAVRE DE GRACE",
  drawn as stroke centrelines on a 100-unit cap-height grid. Two faces:
  `buildFont` is geometric (Futura/Jost-flavoured) and `buildGrotesque` is a
  light neo-grotesque matching the wordmark on the existing logo — the G has a
  spur, the R a straight leg, the D flat sides, and A and V have truncated
  apexes, because a mitred point at that angle throws a spike well past the cap
  line. The wordmark is outlined geometry rather than `<text>`, so the files
  render identically with no font installed.
- `round-1.mjs` … `round-4.mjs` — the compositions, one file per review round.
  Kept as first drawn; `round-1.mjs` in particular must keep rendering
  byte-identical output when the shared module changes.
- `suite.mjs` — the delivery set, grouped by the job each file does: `a` core
  marks, `b` lockups, `c` icons and avatars, `d` composed assets at fixed pixel
  dimensions, `e` guides. Groups a, b, c and e paint with `currentColor` so one
  file serves ink, reversed and accent; group d bakes its background in. Earlier rounds are kept exactly as first drawn so the page can
  show them all together; `round-1.mjs` in particular must keep rendering
  byte-identical output when the shared module changes.
  Round three varies only the foot of the round-two seal, so it all runs
  through one `seal()` builder and the alternatives compare like for like.

`suite.mjs` also carries the small-size draws: `anchorCompact` and, built on
it, `sealCompact`. The signed-off anchor has a crown one seventh the weight of
its height; below roughly 32px that fills in, so the compact draw fattens the
crown, stock and shank and opens the shackle. Use it under 32px. The seal's two
rules sit 22 units apart on a 680-unit box, which is under a pixel anywhere
near that size, so the compact seal keeps one thickened rule. Use it under
64px — the nav bar and the favicon both do.
