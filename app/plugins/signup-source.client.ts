/*
 * Records `?from=<platform>` from the source links (/youtube, /tiktok, /instagram, /shows) on
 * the visitor's first page. See useSignupSource.
 *
 * Client-only, because every page is prerendered to one shared HTML file and
 * the query string never reaches a server. It reads window.location rather
 * than useRoute because the router may not have resolved the first route yet
 * when plugins run.
 */
export default defineNuxtPlugin(() => {
  const from = new URLSearchParams(window.location.search).get('from')

  if (isSignupSource(from)) {
    useSignupSource().value = from
  }
})
