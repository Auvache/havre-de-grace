// Album copy marks emphasis with *asterisks* (e.g. a moniker or an artist name).
// Display surfaces render the marked runs in italics via `<RichText>`; plain-text
// contexts (meta tags, structured data) strip the markers instead.

const EMPHASIS_PATTERN = /\*([^*]+)\*/g

export interface TextRun {
  text: string
  emphasis: boolean
}

export const toTextRuns = (value?: string | null): TextRun[] => {
  if (!value) {
    return []
  }

  const runs: TextRun[] = []
  let lastIndex = 0

  for (const match of value.matchAll(EMPHASIS_PATTERN)) {
    const start = match.index ?? 0

    if (start > lastIndex) {
      runs.push({ text: value.slice(lastIndex, start), emphasis: false })
    }

    runs.push({ text: match[1], emphasis: true })
    lastIndex = start + match[0].length
  }

  if (lastIndex < value.length) {
    runs.push({ text: value.slice(lastIndex), emphasis: false })
  }

  return runs
}

export const stripEmphasis = (value?: string | null) => value?.replace(EMPHASIS_PATTERN, '$1') ?? ''
