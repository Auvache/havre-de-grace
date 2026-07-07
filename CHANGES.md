# Pending Changes

Running list of small fixes/tweaks to make. Add to this list as they come up; we'll batch-implement later.

## Done

### 1. Navbar underline shows on "music"/"contact" even when their section isn't in view

- **Fix applied:** `isActive()` in `app/components/global/AppNavbar.vue` now returns `false` for any hash link, so the underline no longer shows for `music`/`contact` regardless of scroll position.

### 2. Clicking a hash nav link (music/contact) from another page lands at the top of the homepage, not the section

- **Fix applied:** `app/router.options.ts` `scrollBehavior` now waits (via `MutationObserver`, capped at 2s) for the hash target element to mount when navigating cross-route before resolving the scroll target.

## 3. (add next item here)
