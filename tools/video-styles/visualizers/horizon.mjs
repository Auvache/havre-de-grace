/*
 * Meet Me at the Horizon · Lying awake — the stills on
 * /music-videos/meet-me-at-the-horizon, three directions.
 *
 * The film is shared/video/films/horizon.mjs; this only adapts its plate to
 * the concept contract (a plate-only frame for sheet.mjs's still()) and picks
 * the moments each direction is shown at. The times are song seconds read off
 * the measured score (app/config/meetMeAtTheHorizonScore.ts): the dreaming
 * gaps are the ones horizonGaps() finds there.
 */
import { horizonPlate } from '../../../shared/video/films/horizon.mjs'

const plate = (direction) => ({ time, score, uid }) => horizonPlate({ time, score, uid, direction })

export const HORIZON_VARIANTS = [
  {
    id: 'nightmares',
    name: 'Nightmares',
    summary: 'The star atlas, with a third act. The verses keep him awake: every line that names a thing joins stars into it, and red sparks jump between stars on the sung words. But in every real silence in the singing (the intro, and six gaps of two to three seconds, measured from the record) the sky reddens and every figure he has drawn turns into its bad version, relabelled in red: the sheep a wolf, the moon a blood moon, the bed a coffin, the eye many eyes, someone standing in the door of the house, a hand through the window, a black sun, a dead tree, the clock spinning. The longest gap comes straight after the first "meet me at the horizon": the lover turns away and the ground cracks. The next sung word jolts him awake, a white flash and a shake, and everything snaps back. After the last "meet me at the horizon" no nightmare comes: the sun comes up behind the two of them and he sleeps.',
    frame: plate('nightmares'),
    moments: [15.5, 28.6, 58.4, 71.6, 72.3, 99.8, 129.3, 141.2, 141.9, 188.3, 192, 214],
  },
  {
    id: 'constellations',
    name: 'Constellations',
    summary: 'A star-atlas plate of the night sky over a black ridge. Every line that names a thing joins stars that were already there into it, drawn by a red pen on the line\'s first word and labelled like an atlas, in Latin: the sheep he isn\'t counting, the moon, the bed, an hourglass, the clock, the tree, the dawn, the eye, the spine, the house, the window, him alone. Each holds and fades to a ghost, so the sky fills with everything he has thought about tonight. Red sparks jump between stars on the sung words, the racing mind, thick in the verses. Gold comes up behind the ridge in each chorus, higher each time. On the first "meet me at the horizon" two figures stand on the ridge, not yet touching; on the last, his red and her gold, their hands meet, and the stars go out into the morning.',
    frame: plate('constellations'),
    moments: [28.6, 47, 58.4, 99.8, 129.3, 153.8, 192, 214],
  },
  {
    id: 'monkey-brain',
    name: 'Monkey Brain',
    summary: 'A sleep lab\'s EEG chart: the head from above, nineteen electrodes on the 10–20 layout, the technician\'s notes beside it. His mind is a red point swinging from electrode to electrode on every sung word, a big swing on every line, and every swing leaves a pencil arc, so by the end the head is covered in the night\'s scribble. The technician notes what each line was about. The hypnogram under it is stuck at WAKE: it slips towards sleep only in the gaps and is pulled straight back up by the next thought. In the outro the swings stop, the window turns gold and the trace drops to N3.',
    frame: plate('monkey-brain'),
    moments: [15.5, 28.6, 58.4, 71.6, 99.8, 141.2, 212],
  },
]
