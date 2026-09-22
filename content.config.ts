import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {

    /*
     * --- Tools at /resources -------------------------------------------
     *
     * Three browser-based tools for independent musicians (see
     * shared/data/resources.ts). Each one is a single YAML file so Stefan can
     * edit a checklist item, a directory entry or a scoring weight without
     * opening a component.
     */
    resourcesChecklist: defineCollection({
      type: 'data',
      source: 'resources/royalty-checklist.yml',
      schema: z.object({
        lastVerified: z.string(),
        /** Account-level steps, done once rather than per song. */
        setup: z.array(z.object({
          id: z.string(),
          label: z.string(),
          collects: z.string(),
          whoNeedsThis: z.string(),
          url: z.string().optional(),
          urlLabel: z.string().optional(),
          sourceUrl: z.string().optional(),
          note: z.string().optional(),
        })),
        /** The same list is applied to every song the user adds. */
        items: z.array(z.object({
          id: z.string(),
          label: z.string(),
          collects: z.string(),
          whoNeedsThis: z.string(),
          /** Shown as a column heading in the overview table. */
          short: z.string(),
          optional: z.boolean().default(false),
          url: z.string().optional(),
          urlLabel: z.string().optional(),
          sourceUrl: z.string().optional(),
          caution: z.string().optional(),
        })),
      }),
    }),

    resourcesFunding: defineCollection({
      type: 'data',
      source: 'resources/funding.yml',
      schema: z.object({
        lastVerified: z.string(),
        /** One line per type, shown as a legend above the filters. */
        legend: z.array(z.object({
          type: z.string(),
          label: z.string(),
          blurb: z.string(),
        })),
        entries: z.array(z.object({
          name: z.string(),
          type: z.enum(['grant', 'advance', 'loan', 'emergency', 'fan-funding']),
          region: z.string(),
          amount: z.string(),
          eligibility: z.string(),
          /**
           * ISO date | "rolling" | "annual (typically <month>)" | a free note.
           * Parsed at view time, never at build time — see useFundingDirectory.
           */
          deadline: z.string(),
          /** Month name a closed annual programme typically reopens in. */
          reopens: z.string().optional(),
          repay: z.boolean(),
          tradeoff: z.string(),
          url: z.string(),
          sourceUrl: z.string(),
          lastVerified: z.string(),
          /** Anything still unconfirmed, surfaced on the card rather than hidden. */
          verifyNote: z.string().optional(),
        })),
      }),
    }),

    resourcesPromoChecker: defineCollection({
      type: 'data',
      source: 'resources/promo-checker.yml',
      schema: z.object({
        lastVerified: z.string(),
        /** Risk bands, applied to the share of the available weight scored. */
        thresholds: z.object({
          caution: z.number(),
          high: z.number(),
        }),
        modes: z.array(z.object({
          id: z.string(),
          label: z.string(),
          blurb: z.string(),
          questions: z.array(z.object({
            id: z.string(),
            question: z.string(),
            /** Which answer counts as a red flag. */
            flagOn: z.enum(['yes', 'no']),
            /** Contribution to the score when flagged. */
            weight: z.number(),
            /**
             * A single flag here is enough for a High reading on its own.
             * Reserved for behaviour that already breaks a DSP's own rules.
             */
            decisive: z.boolean().default(false),
            /** One sentence explaining why this is a flag. */
            why: z.string(),
            /** Half weight when the user answers "unsure". */
            unsureCounts: z.boolean().default(true),
          })),
        })),
        /** Shown under the result, in order. */
        nextSteps: z.array(z.object({
          level: z.enum(['low', 'caution', 'high']),
          steps: z.array(z.string()),
        })),
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
