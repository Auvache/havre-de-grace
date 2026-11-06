/*
 * Conman's visualizer, v2 (2026-11-05): the heists. Five heist plans on the
 * insurance-atlas town whose streets are the anchor, police chases in the two
 * choruses, and a final chase whose red trails draw the anchor as the camera
 * pulls out. The whole film is conman-heists/film.mjs; the town is
 * conman-heists/city.mjs; each heist and chase is its own module beside it.
 * What it does and what the user decided: docs/visualizers/conman.md.
 *
 * Replaces conman-city.mjs (v1) on /visualizers/conman, which is kept for now.
 */
export { conmanFilm as conmanHeistsFrame, FILM_BEATS as CONMAN_HEISTS_BEATS, FINALE_TESTS as CONMAN_FINALE_TESTS, FINALE_WINDOW as CONMAN_FINALE_WINDOW } from './conman-heists/film.mjs'
/* The finale tests by name, for frames.mjs; gone once one is picked. */
import { FINALE_TESTS } from './conman-heists/film.mjs'
export const conmanFinaleD = FINALE_TESTS[0].film
export const conmanFinaleE = FINALE_TESTS[1].film
export const conmanFinaleF = FINALE_TESTS[2].film
