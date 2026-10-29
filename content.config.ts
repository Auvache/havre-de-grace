import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { isPublished, readLetterFiles } from './shared/utils/letterSchedule'

// Letters that aren't out yet stay out of the build entirely; see
// shared/utils/letterSchedule.ts for why hiding them in the page isn't enough.
// `nuxt dev` keeps every letter, so the bank can be read back before it ships.
const unpublishedLetters = process.env.NODE_ENV === 'production'
  ? readLetterFiles('content/letters')
      .filter((letter) => !isPublished(letter))
      .map((letter) => `letters/${letter.file}`)
  : []

export default defineContentConfig({
  collections: {
    // The monthly letter, archived at /letters. The filename is the slug.
    letters: defineCollection({
      type: 'page',
      source: {
        include: 'letters/*.md',
        exclude: unpublishedLetters,
      },
      schema: z.object({
        // The day it was emailed. Leave it off and the letter is a draft.
        date: z.string().optional(),
        // The day it goes up here, when that isn't a week after `date`.
        published: z.string().optional(),
        // Which core idea it serves: small-hours, finish-over-perfect,
        // presence-over-persuasion, capture-everything, life-feeds-the-art.
        idea: z.string().optional(),
        // A story-behind-a-song letter: the raw material for the book.
        song: z.string().optional(),
      }),
    }),
    music: defineCollection({
      type: 'data',
      source: 'music/*.yml',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        year: z.number(),
        releaseDate: z.string().optional(),
        isLatest: z.boolean().optional(),
        isVisible: z.boolean().optional(),
        isSingle: z.boolean().optional(),
        parentAlbumSlug: z.string().optional(),
        coverImage: z.string(),
        coverAlt: z.string(),
        // Pre-rendered 1200x1200 JPEG for social cards. The full-size cover art
        // is a 3000x3000, multi-megabyte original: too large for scrapers and
        // the wrong thing to declare dimensions for. Omit to fall back to the
        // site's brand og-image.jpg.
        ogImage: z.string().optional(),
        // Optional album back cover, shown alongside the front in the /listen player
        // while a song plays. Omit if the release has no back artwork.
        backCoverImage: z.string().optional(),
        backCoverAlt: z.string().optional(),
        description: z.string().optional(),
        // Record player (/listen): which tracks sit on each vinyl side.
        sides: z.object({
          a: z.array(z.number()),
          b: z.array(z.number()),
        }).optional(),
        streamingLinks: z.object({
          spotify: z.string().optional(),
          appleMusic: z.string().optional(),
          youtubeMusic: z.string().optional(),
          amazonMusic: z.string().optional(),
          bandcamp: z.string().optional(),
          soundcloud: z.string().optional(),
          youtube: z.string().optional(),
          instagram: z.string().optional(),
        }),
        leadSingle: z.object({
          title: z.string(),
          streamingLinks: z.object({
            spotify: z.string().optional(),
            appleMusic: z.string().optional(),
            youtubeMusic: z.string().optional(),
            amazonMusic: z.string().optional(),
            bandcamp: z.string().optional(),
            soundcloud: z.string().optional(),
            youtube: z.string().optional(),
            instagram: z.string().optional(),
          }),
        }).optional(),
        tracklist: z.array(z.object({
          title: z.string(),
          duration: z.string().optional(),
          lyrics: z.string().optional(),
          // Absolute public path to the playable audio file, e.g.
          // "/albums/<slug>/music/scarecrow.mp3". Filenames don't derive cleanly
          // from titles, so this is set explicitly. Used by the /listen record player.
          audio: z.string().optional(),
          // --- Per-song archive (all optional). Shown in the /listen
          // record player's Notes drawer. ---
          // Prose about how the song was written.
          writingStory: z.string().optional(),
          // Prose about how the song was recorded.
          recordingDetails: z.string().optional(),
          // 2-3 photos shown borderless and uncaptioned around the player.
          photos: z.array(z.object({
            src: z.string(),
            alt: z.string().optional(),
          })).optional(),
          // Per-song liner notes: production, writing, instrumentation credits, etc.
          credits: z.array(z.object({
            role: z.string(),
            name: z.string(),
          })).optional(),
        })),
        linerNotes: z.string().optional(),
        linerNoteImages: z.array(z.object({
          src: z.string(),
          alt: z.string(),
        })).optional(),
        videos: z.array(z.object({
          title: z.string(),
          url: z.string(),
          description: z.string().optional(),
        })).optional(),
        credits: z.array(z.object({
          role: z.string(),
          name: z.string(),
        })).optional(),
        pressQuotes: z.array(z.object({
          quote: z.string(),
          source: z.string().optional(),
        })).optional(),
        epkDownloadUrl: z.string().optional(),
      }),
    }),
  },
})
