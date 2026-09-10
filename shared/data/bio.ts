/**
 * The /about bio, as data.
 *
 * This prose used to live as literal <p> tags inside
 * app/components/about/BioSection.vue. It moved here because it now has a
 * second consumer: modules/agent-discovery.ts renders it into /about.md for
 * the markdown mirror. Two hand-maintained copies of the same four paragraphs
 * would have drifted, and a markdown mirror that contradicts the page it
 * mirrors is worse for an agent than no mirror at all.
 *
 * `emphasis: true` is the pull-quote — italic on the page, blockquoted in
 * markdown. It is the only per-paragraph styling the section ever had.
 */
export interface BioParagraph {
  text: string
  emphasis?: boolean
}

export const bioParagraphs: BioParagraph[] = [
  {
    text: 'Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley.',
  },
  {
    text: `"I love music and music loves me. I can't help but play the guitar and write songs."`,
    emphasis: true,
  },
  {
    text: 'Stefan was raised on an eclectic mix of music, ranging from Led Zeppelin, REO Speedwagon, and Heart to Michael Jackson and Donny Osmond. As he grew up and branched out into his own musical discoveries, he fell in love with the music of Bob Dylan, Jack White, John Mayer, and Kristian Matsson\'s Tallest Man on Earth. All of these influences have shaped him as a guitar player, a songwriter, and a person.',
  },
  {
    text: 'His first album, I Want to Be Yours and Other Songs, was originally released under the moniker Stefan Auvache in July 2025. His second album, Into the Wild, was released in July 2026.',
  },
]
