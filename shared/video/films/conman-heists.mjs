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
export { conmanFilm as conmanHeistsFrame, FILM_BEATS as CONMAN_HEISTS_BEATS } from './conman-heists/film.mjs'
