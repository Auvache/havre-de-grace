/*
 * The proposed stills on /visualizers/<song> for the songs with no film yet —
 * GENERATED, do not edit. Written by
 * `SITE=1 node tools/video-styles/visualizers/build.mjs` along with every
 * still under public/visualizers/. The words are in docs/visualizers/<song>.md.
 */

export interface VisualizerStill { time: number; src: string }
export interface ProposedVisualizer { id: string; name: string; stills: VisualizerStill[] }

export const VISUALIZER_STILLS: Record<string, ProposedVisualizer[]> = {
  "rocks-in-the-sea": [
    {
      "id": "cairn",
      "name": "The Cairn",
      "stills": [
        {
          "time": 45.5,
          "src": "/visualizers/rocks-in-the-sea/cairn-1.svg"
        },
        {
          "time": 97,
          "src": "/visualizers/rocks-in-the-sea/cairn-2.svg"
        },
        {
          "time": 168,
          "src": "/visualizers/rocks-in-the-sea/cairn-3.svg"
        },
        {
          "time": 200,
          "src": "/visualizers/rocks-in-the-sea/cairn-4.svg"
        }
      ]
    },
    {
      "id": "tide-table",
      "name": "Tide Table",
      "stills": [
        {
          "time": 52,
          "src": "/visualizers/rocks-in-the-sea/tide-table-1.svg"
        },
        {
          "time": 98,
          "src": "/visualizers/rocks-in-the-sea/tide-table-2.svg"
        },
        {
          "time": 126,
          "src": "/visualizers/rocks-in-the-sea/tide-table-3.svg"
        },
        {
          "time": 206,
          "src": "/visualizers/rocks-in-the-sea/tide-table-4.svg"
        }
      ]
    },
    {
      "id": "windscreen",
      "name": "Windscreen",
      "stills": [
        {
          "time": 31,
          "src": "/visualizers/rocks-in-the-sea/windscreen-1.svg"
        },
        {
          "time": 90.5,
          "src": "/visualizers/rocks-in-the-sea/windscreen-2.svg"
        },
        {
          "time": 120,
          "src": "/visualizers/rocks-in-the-sea/windscreen-3.svg"
        },
        {
          "time": 205,
          "src": "/visualizers/rocks-in-the-sea/windscreen-4.svg"
        }
      ]
    },
    {
      "id": "road-home",
      "name": "The Road Home",
      "stills": [
        {
          "time": 45.5,
          "src": "/visualizers/rocks-in-the-sea/road-home-1.svg"
        },
        {
          "time": 104,
          "src": "/visualizers/rocks-in-the-sea/road-home-2.svg"
        },
        {
          "time": 165,
          "src": "/visualizers/rocks-in-the-sea/road-home-3.svg"
        },
        {
          "time": 218,
          "src": "/visualizers/rocks-in-the-sea/road-home-4.svg"
        }
      ]
    },
    {
      "id": "undertow",
      "name": "Undertow",
      "stills": [
        {
          "time": 52,
          "src": "/visualizers/rocks-in-the-sea/undertow-1.svg"
        },
        {
          "time": 98,
          "src": "/visualizers/rocks-in-the-sea/undertow-2.svg"
        },
        {
          "time": 128,
          "src": "/visualizers/rocks-in-the-sea/undertow-3.svg"
        },
        {
          "time": 214,
          "src": "/visualizers/rocks-in-the-sea/undertow-4.svg"
        }
      ]
    }
  ]
}
