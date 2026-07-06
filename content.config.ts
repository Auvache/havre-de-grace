import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
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
        description: z.string().optional(),
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
