/**
 * The /press electronic press kit, as data.
 *
 * Same reasoning as shared/data/bio.ts: this prose has more than one consumer.
 * The page renders it, modules/agent-discovery.ts mirrors it into /press.md,
 * and modules/press-kit.ts writes each bio into the downloadable .zip as a
 * plain .txt. Three hand-maintained copies would drift, and a press kit whose
 * zip disagrees with the page it came from is worse than no zip at all.
 *
 * Three lengths because that is what outlets actually ask for: a one-line
 * listing blurb, a paragraph for a show announcement or blog post, and a full
 * bio for a feature. Writing them here means a journalist copies the length
 * they need instead of cutting one down themselves.
 */
export interface PressBio {
  /** Stable id — also the filename stem inside the zip. */
  id: string
  label: string
  /** What this length is for, shown under the label on the page. */
  usage: string
  text: string
}

export const pressBios: PressBio[] = [
  {
    id: 'short-bio',
    label: 'Short bio',
    usage: 'One or two lines — festival programs, show listings, socials.',
    text: 'Havre De Grace is the acoustic folk project of singer-songwriter Stefan Auvache Bradley, based in Vancouver, Washington. He released his debut, I Want to Be Yours and Other Songs, in July 2025, and his second album, Into the Wild, in July 2026.',
  },
  {
    id: 'medium-bio',
    label: 'Medium bio',
    usage: 'A single paragraph — show announcements, blog posts, newsletters.',
    text: `Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley, who writes and records acoustic folk music in Vancouver, Washington. He was raised on an eclectic mix of Led Zeppelin, REO Speedwagon, Heart, Michael Jackson and Donny Osmond, and found his own footing later in the songwriting of Bob Dylan, Jack White, John Mayer and Kristian Matsson's Tallest Man on Earth. His debut album, I Want to Be Yours and Other Songs, arrived in July 2025 under the name Stefan Auvache. Into the Wild followed on July 17, 2026 — a record built to be heard front to back.`,
  },
  {
    id: 'long-bio',
    label: 'Long bio',
    usage: 'Full biography — features, interviews, program notes.',
    text: `Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley, who writes and records acoustic folk music in Vancouver, Washington.

"I love music and music loves me. I can't help but play the guitar and write songs."

Stefan was raised on an eclectic mix of music, ranging from Led Zeppelin, REO Speedwagon, and Heart to Michael Jackson and Donny Osmond. As he grew up and branched out into his own musical discoveries, he fell in love with the music of Bob Dylan, Jack White, John Mayer, and Kristian Matsson's Tallest Man on Earth. All of these influences have shaped him as a guitar player, a songwriter, and a person.

His first album, I Want to Be Yours and Other Songs, was originally released under the moniker Stefan Auvache in July 2025. His second album, Into the Wild, was released on July 17, 2026, and represents the true beginning of the Havre De Grace project. Its songs were selected, organized, and produced with the intention of being listened to as a whole body of work, exploring what music means to the artist and the listener — adventure, creativity, self-identity, and a medium for working through big emotions.`,
  },
]
