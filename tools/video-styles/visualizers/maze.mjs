/*
 * Into the Wild · The Maze — the concept stills on /music-videos/off-the-grid.
 *
 * The film is shared/video/films/maze.mjs; this only adapts its plate to the
 * concept contract (a plate-only frame for sheet.mjs's still()), keeping just
 * the wall bands a still actually uses so each SVG carries only its own maze.
 */
import { mazePlate } from '../../../shared/video/films/maze.mjs'

function frame({ time, uid }) {
  const { plate, lib } = mazePlate({ time, uid })
  const used = new Set([...plate.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))
  const defs = [...lib.matchAll(/<path id="([^"]+)"[^>]*\/>/g)].filter((m) => used.has(m[1])).map((m) => m[0]).join('')
  return `<defs>${defs}</defs>${plate}`
}

/** Twelve moments: the way in, each maze, the scramble, the breath, the way out, the pull back. */
export const MAZE_MOMENTS = [6, 14, 32, 48.5, 58, 85, 106, 135, 154, 172, 186, 196, 204]

export const MAZE = {
  id: 'maze',
  name: 'The Maze',
  summary: 'Blank paper, and the red line comes in from the left to the centre, where a maze draws itself around it. It wanders and finds the way out on the first chorus, straight into a bigger maze growing round the first; out again on the second chorus, into a third, very complex one. Through the horns it scrambles, frantic, pulse racing, and gets nowhere: the faint red scribble. At verse 3 it stops and takes a deep breath, then walks the clean way out, solid red through the scribble, reaching the door as the last chorus starts. The camera pulls back: all three were the middle of a maze too big to see the edge of, and he walks on into it, calm. The dot pulses like breathing the whole time: slow when calm, racing in the panic.',
  frame,
  moments: MAZE_MOMENTS,
}
