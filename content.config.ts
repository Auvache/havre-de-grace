import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {

    /*
     * --- Lunch Break Records -------------------------------------------
     *
     * The resources section at /resources (see shared/lunch-break/config.ts).
     * Everything it renders lives under content/lunch-break/ so the whole
     * sub-brand can be lifted to its own site in one move.
     *
     * Articles are markdown with frontmatter; the three tools are each a
     * single YAML file so Stefan can edit a checklist item, a directory entry
     * or a scoring weight without opening a component.
     */
    lunchBreakArticles: defineCollection({
      type: 'page',
      source: 'lunch-break/articles/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        /** Tool slug this article is paired with, or null for a standalone. */
        pairedTool: z.string().nullable().optional(),
        /** ISO date the factual claims on the page were last checked. */
        lastVerified: z.string(),
        /** Drafts are Stefan's to edit; see LUNCH_BREAK.showDrafts. */
        draft: z.boolean().default(true),
        /** Sort order on the hub, low to high. */
        order: z.number().default(50),
        /** Rough read time in minutes, stated rather than computed. */
        readingMinutes: z.number().optional(),
        /**
         * The brand's signature: the five-minute answer, above the guide.
         * Lives in frontmatter rather than in the body so the hub, the meta
         * description and the FAQ JSON-LD can all reuse the same words.
         */
        lunchBreak: z.object({
          answer: z.string(),
          today: z.array(z.string()),
        }),
        /** Primary sources behind the page, shown at the foot of the article. */
        sources: z.array(z.object({
          label: z.string(),
          url: z.string(),
          lastVerified: z.string(),
        })).default([]),
        /** Question-shaped Q&A pairs, emitted as FAQPage JSON-LD when >= 3. */
        faq: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })).default([]),
        /** Slugs of other articles to send the reader to at the end. */
        related: z.array(z.string()).default([]),
      }),
    }),

    lunchBreakChecklist: defineCollection({
      type: 'data',
      source: 'lunch-break/royalty-checklist.yml',
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

    lunchBreakFunding: defineCollection({
      type: 'data',
      source: 'lunch-break/funding.yml',
      schema: z.object({
        lastVerified: z.string(),
        /** One line per type, shown as a legend above the filters. */
        legend: z.array(z.object({
          type: z.string(),
          label: z.string(),
          blurb: z.string(),
          /** Anchor in the paired article, e.g. "#grants". */
          articleAnchor: z.string().optional(),
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

    lunchBreakPromoChecker: defineCollection({
      type: 'data',
      source: 'lunch-break/promo-checker.yml',
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
