# Fourthwall Headless Merch Store — Implementation Guide

> **Status (2026-11-04): parked, not started.** Plan is a few core items plus some seasonal designs. Seasonal drops fit the "limited drops on a dedicated collection" idea in §9.

> **For the coding agent:** This is a working brief, not a script to run blindly. Read it all once, do Phase 0 recon, then work phase by phase. Check in with the human at every **🛑 CHECKPOINT**. Where this doc and the live Fourthwall docs disagree, **the live docs win** — tell the human what changed.

---

## 1. Goal & context

Add a merch store to the human's website. Products are shown in the site's own pages, with its own styling and components. **Fourthwall** handles everything after "Checkout": payment, sales tax/VAT (Fourthwall is merchant of record), printing, shipping, returns and customer support.

**What the store is for:** growing the fanbase, and breaking even or building a small cash buffer. Margin is *not* a priority. Ease of maintenance for the human **is** the top priority. When choosing between approaches, pick the one with less ongoing work for the human, even if it costs flexibility.

### Decisions already made (don't relitigate)
- **Platform:** Fourthwall Storefront API (headless). Not Printful/Printify direct, not Shopify.
- **Checkout:** Fourthwall's hosted checkout. We redirect to it and never collect payment or address data ourselves.
- **Returns, support, tax:** fully delegated to Fourthwall. The site only links to policies and the support email.
- **Products:** print-on-demand only (no self-fulfilled inventory).
- **No database and no order storage on our side** in v1.

### Out of scope for v1
Custom payment flows, Stripe, webhooks, order history pages, user accounts, memberships, multi-currency switching, inventory management. (See §9 for optional later ideas.)

---

## 2. Ground rules for the agent

1. **Recon first.** Learn the repo's conventions (framework version, styling system, component library, image handling, lint and test setup) before writing code. Match them.
2. **Verify API shapes. Don't guess.** Pull exact request/response schemas from the OpenAPI spec: `https://docs.fourthwall.com/openapi/storefront.json` (index of all docs: `https://docs.fourthwall.com/llms.txt`). Generate or handwrite TypeScript types from it.
3. **Keep the storefront token server-side.** Fourthwall's docs allow calling the API straight from the browser, but proxy through server routes anyway. This keeps the token out of the bundle, gives one place to cache, and avoids CORS surprises.
4. **Accessibility is a requirement, not polish.** Target WCAG 2.1 AA (details in Phase 5).
5. **Small, reviewable commits**, one per phase where practical.
6. **Never commit secrets.** Use `.env` plus runtime config, and add example keys to `.env.example`.
7. Ask before adding new dependencies beyond trivial ones.

---

## 3. Human prerequisites (Fourthwall dashboard — agent cannot do these)

The agent should confirm these are done, or walk the human through them, before Phase 2. 🛑 **CHECKPOINT:** ask the human for the values marked **→ give to agent**.

- [ ] Create a Fourthwall account and shop.
- [ ] Create at least 1–2 products. (Real products, not placeholders, so the API returns realistic data. They can be hidden or unlisted at first.)
- [ ] Create a collection for the site (e.g. `site-merch`). The built-in `all` collection also works. **→ give to agent: collection handle**
- [ ] Settings → For Developers → **Storefront API** tab (older docs call it "Headless") → copy the token. **→ give to agent: token (via `.env`, never pasted into chat history if avoidable)**
- [ ] Note the shop/checkout domain, e.g. `yourshop.fourthwall.com`. **→ give to agent: checkout domain**
- [ ] *(Recommended)* Connect a custom checkout domain like `checkout.yoursite.com` (Settings → Domain) so the redirect feels seamless.
- [ ] Style the checkout: use a simple theme (Fourthwall suggests "Clean Frame") and set colors and typography to match the site.
- [ ] *(Recommended)* Add the "meta redirect" script to the Fourthwall shop's Head (Store design → General → Advanced). It sends visitors who land on non-checkout Fourthwall pages (for example from email links) back to the main site. The snippet is in the Checkout Setup doc linked in §10.
- [ ] Find the shop's support email (`<shop>@support.fourthwall.com`). **→ give to agent**
- [ ] Order a sample of each product to check print quality before launch.

---

## 4. Architecture

```
Browser (site pages, cart UI)
   │  fetch /api/shop/*
   ▼
Site server routes (proxy, token lives here, short cache)
   │  https://storefront-api.fourthwall.com/v1/...?storefront_token=…
   ▼
Fourthwall Storefront API
   
Checkout button ──redirect──▶ https://{checkout_domain}/checkout/?cartCurrency=USD&cartId={id}
                               (Fourthwall handles payment → order → emails → support)
```

### Key API facts (verify against the OpenAPI spec)
- **Base:** `https://storefront-api.fourthwall.com/v1`
- **Auth:** `storefront_token` query param (used in all doc examples). The help center also mentions `Authorization: Bearer`. Use whichever the spec confirms.
- **Products come through collections.** There is no standalone "list products" endpoint.
  - `GET /collections` — all collections
  - `GET /collections/{handle}/products?page=0&size=50` → `{ results, paging: { hasNextPage } }`. Every shop has a built-in `all` collection.
  - `GET /products/{slug}` — a single product
- **Product `type`:** `PRODUCT` (has `variants`) or `BUNDLE` (has `offers`, no variants of its own). v1 can **skip bundles**: filter out `type === "BUNDLE"` and leave a TODO.
- **Carts:**
  - `POST /carts` body `{ currency: "USD" }` (it can also take `items`) → `{ id, ... }`
  - `GET /carts/{id}` → `items`, `totals`
  - `POST /carts/{id}/add` body `{ items: [{ variantId, quantity }] }`
  - Remove item and change quantity endpoints exist. Get exact paths and bodies from the API reference.
- **Checkout URL:** `https://{checkout_domain}/checkout/?cartCurrency={currency}&cartId={cartId}`. Use the **checkout domain**, never the API domain.
- **Fallback (no cart API):** `https://{shop_domain}/cart/checkout?products={variantId}:{qty},{variantId2}:{qty}`. This is useful for a "Buy now" button.

---

## 5. Phases

### Phase 0 — Recon (no code changes)
- Identify the framework and version (the human's site is likely Nuxt). Find where server routes, composables, pages and runtime config live.
- Identify the styling approach, existing UI components (buttons, cards, dialogs or drawers), the image component or `@nuxt/image` setup, and the icon set.
- Check for an existing layout header or nav where a "Shop" link and cart icon would go.
- Check the test, lint and typecheck commands.
- **Output:** a short summary plus a proposed file list for the next phases. 🛑 **CHECKPOINT:** the human approves the plan.

### Phase 1 — Config
- Add env vars, for example:
  - `FOURTHWALL_STOREFRONT_TOKEN` (server-only)
  - `FOURTHWALL_COLLECTION` (default `all`)
  - `FOURTHWALL_CHECKOUT_DOMAIN` (public: the browser needs it to redirect)
  - `FOURTHWALL_SUPPORT_EMAIL` (public)
- Wire them into runtime config with secret and public separated. Update `.env.example`.
- If the site uses `@nuxt/image` (or similar), allow Fourthwall's image CDN host. Get the actual host from a real API response.

### Phase 2 — Server proxy routes
Create thin routes that add the token and pass the response through (or trim it):
- `GET  /api/shop/products` → `/collections/{FOURTHWALL_COLLECTION}/products` (handle pagination server-side, return a flat list)
- `GET  /api/shop/products/[slug]` → `/products/{slug}`
- `POST /api/shop/cart` → create a cart
- `GET  /api/shop/cart/[id]` → get a cart
- `POST /api/shop/cart/[id]/add`, plus remove and change-quantity routes as the spec defines

Requirements:
- **Cache product reads** briefly (for example 5–15 minutes, via the framework's route rules or cached handlers). **Never cache cart routes.**
- Validate inputs: UUID-shaped IDs, positive integer quantities with a sane max (e.g. 10).
- Map Fourthwall errors to clean HTTP errors. Never leak the token in error messages or logs.
- **Acceptance:** `curl` each route locally and get real data back.

### Phase 3 — Types and data layer
- Types for Product, Variant, Image, Money and Cart, taken from the OpenAPI spec.
- A `useShopProducts()` / `useShopProduct(slug)` composable (SSR-friendly data fetching).
- A `useCart()` composable:
  - Persist `cartId` in a cookie (SSR-safe) or localStorage.
  - `ensureCart()`: if the stored cart 404s, create a new one (carts can expire).
  - `add(variantId, qty)`, `remove`, `setQty`, `refresh`, `count`, `totals`
  - `checkout()` builds the checkout URL and does `window.location.href = …`
  - Optimistic count update in the UI, reconciled after each API call.

### Phase 4 — Pages and components
- `/shop`: a product grid using the site's card styles. Show name, primary image, price and a sold-out state.
- `/shop/[slug]`: an image gallery, variant pickers (size and color, built from variant attributes), quantity, "Add to cart", description, and a short "made to order" note with a link to the returns policy.
- **Cart drawer or page:** line items, change quantity or remove, a subtotal, and the note "shipping & tax calculated at checkout". Add a **Checkout** button.
- **Header:** a "Shop" nav link and a cart icon with the item count.
- Empty, loading and error states for all of the above.
- Mirror the site's existing design system. **Don't introduce a new visual language.**

### Phase 5 — Accessibility (WCAG 2.1 AA) — required
- Variant pickers are real form controls (`fieldset`/`legend` plus radio inputs, or a properly labelled `select`). Sold-out options are disabled *and* announced.
- "Add to cart" announces the result through an `aria-live="polite"` region (e.g. "Added Black Tee, size M, to cart").
- The cart drawer is a proper dialog: focus moves in, focus is trapped, Esc closes it, and focus returns to the trigger.
- The cart icon has an accessible name that includes the count (e.g. "Cart, 2 items").
- Quantity steppers have labels. Product images have meaningful `alt` text, falling back to the product name and variant.
- Color swatches are never color-only: include a text label.
- Keyboard-only run-through of browse → add → cart → checkout.
- Run an axe check (or the repo's existing a11y tooling) on `/shop`, a product page and the open cart.

### Phase 6 — Policies and trust (low effort, high value)
- Add a `/shop/policies` page (or a section of the shop page) that says, in plain language:
  - Orders are fulfilled by Fourthwall, the merchant of record, which handles payment, tax, shipping and customer support.
  - Items are made to order. There are no returns for change of mind or wrong size ordered. Damaged, defective or wrong items are replaced after you email support with your order number and photos within 30 days of delivery.
  - Support: `{FOURTHWALL_SUPPORT_EMAIL}`
  - Links to Fourthwall's Terms of Service and Privacy Policy.
- Link this page from the product page, the cart and the site footer.
- The human should **review the wording** before launch. 🛑 **CHECKPOINT**

### Phase 7 — SEO and polish
- Page titles and meta descriptions for `/shop` and each product, plus Open Graph images (the product image).
- Optional: `Product` JSON-LD with name, image, price and availability.
- Add the shop pages to the sitemap if the site has one.
- If the site has analytics, track `view_item`, `add_to_cart` and `begin_checkout` (respecting any existing consent or Global Privacy Control handling).

### Phase 8 — Test and launch
- Typecheck, lint and any unit tests for `useCart` (mock fetch).
- Manual end-to-end test: browse → pick a variant → add → change quantity → remove → add again → checkout redirect lands on the Fourthwall checkout with the right items.
- Test a stale or expired `cartId` (manually corrupt it) → the cart recovers by creating a new one.
- Test on mobile widths.
- 🛑 **CHECKPOINT:** the human places **one real order** end to end, to confirm checkout styling, the return-to-site flow and order emails.
- Then make the products public in Fourthwall and ship.

---

## 6. Done criteria (v1)
- [ ] Products render on the site in the site's own styling, from live Fourthwall data.
- [ ] The cart works across page reloads and recovers from expired carts.
- [ ] Checkout redirects to Fourthwall (custom checkout domain if set up), and a real test order succeeds.
- [ ] The token never reaches the client bundle (search the built output for it).
- [ ] Policies page is live and linked. The support email is visible.
- [ ] A11y checks in Phase 5 pass.
- [ ] No new database, no stored customer data.

---

## 7. Ongoing maintenance for the human (should stay near zero)
- Add or edit products **in the Fourthwall dashboard only.** The site picks them up automatically (within the cache window).
- Customer issues go to Fourthwall support, not the human.
- Sales tax is handled by Fourthwall. The human only reports payouts as income.

---

## 8. Known gotchas
- **Use the checkout domain, not the API domain**, in the checkout URL.
- **Carts can disappear.** Always handle a 404 on a stored `cartId`.
- **Bundles have no `variants`.** Skip them in v1 or handle them per the docs.
- **The collection controls visibility.** If a product isn't showing, check that it's in the configured collection and is public.
- **Image host.** Remote images may need allowlisting in the image module config.
- **Caching.** Product data can be up to N minutes stale. That's fine for merch; just tell the human.

---

## 9. Optional later (fanbase-oriented, not v1)
- An email signup near the shop. Fourthwall has mailing lists, or use the site's existing list.
- Limited "drops" on a dedicated collection with a launch date banner.
- Webhooks (`Order placed`, `Cart abandoned`) for a thank-you page, a Discord ping or simple sales stats. HMAC verification is documented.
- Promo codes for the community. These are configured in Fourthwall and work at checkout.
- Fourthwall publishes an **MCP server** for AI assistants to manage the shop. It might help with product admin later.

---

## 10. References
- Docs index (LLM-friendly): https://docs.fourthwall.com/llms.txt
- Storefront OpenAPI: https://docs.fourthwall.com/openapi/storefront.json
- Storefront overview: https://docs.fourthwall.com/storefront/overview.md
- Fetching products: https://docs.fourthwall.com/storefront/products.md
- Cart & checkout tutorial: https://docs.fourthwall.com/storefront/cart-checkout-tutorial.md
- Checkout setup (custom domain, meta redirect): https://docs.fourthwall.com/storefront/checkout.md
- Cart checkout endpoint (direct links): https://docs.fourthwall.com/shop-apis/cart-checkout-endpoint.md
- Webhooks: https://docs.fourthwall.com/webhooks/getting-started.md
- MCP server: https://docs.fourthwall.com/ai/mcp.md
- Returns policy (help center): https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/returns-refunds-and-quality-issues
- Tax / merchant of record: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/creator-tax-information
- Official Next.js starter (useful reference for patterns): https://github.com/FourthwallHQ/vercel-commerce
