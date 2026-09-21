<!--
  Promo & Playlist Scam Checker.

  Questions, weights, thresholds and next steps all come from
  content/lunch-break/promo-checker.yml. This component asks and adds up.

  It pastes nothing, scrapes nothing and calls nothing. There is no URL field
  on purpose: an artist's first instinct is to hand over the link they were
  sent, and a tool that accepted one would be teaching exactly the reflex that
  gets people caught. The questions are all things you can answer by looking.
-->

<template>
  <div class="space-y-10">
    <!-- --- Mode ------------------------------------------------------- -->
    <section aria-labelledby="lb-mode-heading" class="space-y-4">
      <h2 id="lb-mode-heading" class="label-text">What are you checking?</h2>

      <div class="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="lb-mode-heading">
        <button
          v-for="mode in data.modes"
          :key="mode.id"
          type="button"
          role="radio"
          :aria-checked="activeModeId === mode.id"
          class="lb-mode"
          @click="activeModeId = mode.id"
        >
          <span class="lb-mode__label">{{ mode.label }}</span>
          <span class="mt-2 block text-sm leading-relaxed muted-text">{{ mode.blurb }}</span>
        </button>
      </div>
    </section>

    <!-- --- Questions --------------------------------------------------- -->
    <section v-if="activeMode" aria-labelledby="lb-questions-heading" class="space-y-5">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="lb-questions-heading" class="lb-heading">
          {{ activeMode.questions.length }} questions
        </h2>
        <p class="text-sm muted-text">
          {{ answeredCount }} of {{ activeMode.questions.length }} answered
        </p>
      </div>

      <fieldset
        v-for="question in activeMode.questions"
        :key="question.id"
        class="surface-card space-y-4 p-5"
      >
        <legend class="lb-question">{{ question.question }}</legend>

        <div class="flex flex-wrap gap-2">
          <label
            v-for="choice in CHOICES"
            :key="choice.value"
            class="lb-choice"
            :data-selected="answers[question.id] === choice.value"
          >
            <input
              type="radio"
              class="sr-only"
              :name="`${activeMode.id}-${question.id}`"
              :value="choice.value"
              :checked="answers[question.id] === choice.value"
              @change="setAnswer(question.id, choice.value)"
            >
            <span>{{ choice.label }}</span>
          </label>
        </div>

        <p v-if="isFlagged(question)" class="lb-why">
          {{ question.why }}
        </p>
      </fieldset>

      <div class="lb-no-print flex flex-wrap gap-3">
        <button type="button" class="lb-button" @click="clearAnswers">
          Clear answers
        </button>
      </div>
    </section>

    <!-- --- Result ------------------------------------------------------ -->
    <section
      v-if="answeredCount > 0"
      aria-labelledby="lb-result-heading"
      aria-live="polite"
      class="space-y-6"
    >
      <div class="lb-result" :data-level="level">
        <p class="label-text">Reading</p>
        <p id="lb-result-heading" class="lb-result__level">{{ LEVEL_LABEL[level] }}</p>
        <p class="mt-3 max-w-2xl text-sm leading-relaxed">
          {{ LEVEL_BLURB[level] }}
        </p>
        <p v-if="answeredCount < activeQuestionCount" class="mt-3 text-sm muted-text">
          You have answered {{ answeredCount }} of {{ activeQuestionCount }}. The
          reading will move as you finish.
        </p>
      </div>

      <section v-if="triggered.length" aria-labelledby="lb-flags-heading" class="space-y-4">
        <h3 id="lb-flags-heading" class="lb-heading">
          What you flagged
        </h3>
        <ul class="space-y-3">
          <li v-for="flag in triggered" :key="flag.id" class="surface-card space-y-2 p-4">
            <p class="font-medium">{{ flag.question }}</p>
            <p class="text-sm leading-relaxed muted-text">{{ flag.why }}</p>
            <p v-if="flag.partial" class="label-text muted-text">
              Counted at half weight — "not sure" is itself information
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="lb-next-heading" class="space-y-4">
        <h3 id="lb-next-heading" class="lb-heading">What to do next</h3>
        <ol class="lb-steps">
          <li v-for="(step, index) in nextSteps" :key="index">{{ step }}</li>
        </ol>
      </section>

      <p class="lb-heuristic" role="note">
        <strong class="font-medium">This is a heuristic, not a verdict.</strong>
        It is a structured way of noticing things, run on answers only you can
        give. It does not know who you are dealing with, it cannot see the
        playlist, and it is not evidence of anything. A High reading means look
        harder and ask questions — not that anyone has done something wrong.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLunchBreakStorage } from '~/composables/useLunchBreakStorage'

type Choice = 'yes' | 'no' | 'unsure'
type Level = 'low' | 'caution' | 'high'

interface Question {
  id: string
  question: string
  flagOn: 'yes' | 'no'
  weight: number
  why: string
  unsureCounts?: boolean
  decisive?: boolean
}

interface Mode {
  id: string
  label: string
  blurb: string
  questions: Question[]
}

const props = defineProps<{
  data: {
    thresholds: { caution: number, high: number }
    modes: Mode[]
    nextSteps: { level: Level, steps: string[] }[]
  }
}>()

const CHOICES: { value: Choice, label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
]

const LEVEL_LABEL: Record<Level, string> = {
  low: 'Low risk',
  caution: 'Caution',
  high: 'High risk',
}

const LEVEL_BLURB: Record<Level, string> = {
  low: 'Nothing here matches the usual pattern. That is not a guarantee — keep the receipts anyway.',
  caution: 'Some of this fits the pattern. Get the vague parts in writing before any money or access changes hands.',
  high: 'This fits the pattern in ways that are hard to explain innocently. Do not pay, and do not hand over account access.',
}

interface CheckerState {
  version: 1
  modeId: string
  /** Answers per mode, so switching tabs does not throw the other one away. */
  answers: Record<string, Record<string, Choice>>
}

const emptyState = (): CheckerState => ({
  version: 1,
  modeId: props.data.modes[0]?.id ?? '',
  answers: {},
})

const isChoice = (value: unknown): value is Choice =>
  value === 'yes' || value === 'no' || value === 'unsure'

const revive = (parsed: unknown): CheckerState | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const raw = parsed as Partial<CheckerState>
  const answers: CheckerState['answers'] = {}

  for (const [modeId, modeAnswers] of Object.entries(raw.answers ?? {})) {
    if (!modeAnswers || typeof modeAnswers !== 'object') {
      continue
    }
    const cleaned: Record<string, Choice> = {}
    for (const [questionId, value] of Object.entries(modeAnswers)) {
      if (isChoice(value)) {
        cleaned[questionId] = value
      }
    }
    answers[modeId] = cleaned
  }

  const modeId = props.data.modes.some((mode) => mode.id === raw.modeId)
    ? raw.modeId!
    : emptyState().modeId

  return { version: 1, modeId, answers }
}

const { state } = useLunchBreakStorage<CheckerState>('promo-checker', emptyState, revive)

const activeModeId = computed({
  get: () => state.value.modeId,
  set: (value: string) => {
    state.value.modeId = value
  },
})

const activeMode = computed(() =>
  props.data.modes.find((mode) => mode.id === activeModeId.value) ?? props.data.modes[0],
)

const answers = computed(() => state.value.answers[activeModeId.value] ?? {})

const activeQuestionCount = computed(() => activeMode.value?.questions.length ?? 0)

const setAnswer = (questionId: string, choice: Choice) => {
  const forMode = state.value.answers[activeModeId.value] ?? {}
  state.value.answers[activeModeId.value] = { ...forMode, [questionId]: choice }
}

const clearAnswers = () => {
  state.value.answers[activeModeId.value] = {}
}

const answeredCount = computed(() => Object.keys(answers.value).length)

/** A direct hit on the flagged answer. "Not sure" is handled separately. */
const isFlagged = (question: Question) => answers.value[question.id] === question.flagOn

/*
 * `!== false` rather than a truthiness check: @nuxt/content does not write a
 * zod `.default()` into the parsed data for a key the YAML leaves out, so
 * `unsureCounts` arrives undefined on every question that has not opted out.
 * Counting "not sure" is the default behaviour, and a question turns it off by
 * saying `unsureCounts: false` in the data file.
 */
const isPartial = (question: Question) =>
  question.unsureCounts !== false && answers.value[question.id] === 'unsure'

const triggered = computed(() => {
  const mode = activeMode.value
  if (!mode) {
    return []
  }

  return mode.questions
    .filter((question) => isFlagged(question) || isPartial(question))
    .map((question) => ({
      id: question.id,
      question: question.question,
      why: question.why,
      partial: !isFlagged(question),
    }))
})

/*
 * The score is the share of the mode's TOTAL available weight that got
 * flagged — not the share of what has been answered so far. Scoring against
 * answered questions only would let one flag on question one read as 100% and
 * shout "High risk" at someone who has barely started.
 */
const level = computed<Level>(() => {
  const mode = activeMode.value
  if (!mode) {
    return 'low'
  }

  const decisive = mode.questions.some((question) => question.decisive && isFlagged(question))
  if (decisive) {
    return 'high'
  }

  const total = mode.questions.reduce((sum, question) => sum + question.weight, 0)
  if (!total) {
    return 'low'
  }

  const scored = mode.questions.reduce((sum, question) => {
    if (isFlagged(question)) {
      return sum + question.weight
    }
    if (isPartial(question)) {
      return sum + question.weight / 2
    }
    return sum
  }, 0)

  const share = scored / total

  if (share >= props.data.thresholds.high) {
    return 'high'
  }
  if (share >= props.data.thresholds.caution) {
    return 'caution'
  }
  return 'low'
})

const nextSteps = computed(() =>
  props.data.nextSteps.find((entry) => entry.level === level.value)?.steps ?? [],
)
</script>

<style scoped>
.lb-heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}

.lb-mode {
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-md);
  background: var(--theme-surface);
  padding: 1.1rem 1.25rem;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.lb-mode[aria-checked="true"] {
  border-color: var(--color-accent);
  background: var(--theme-bg-soft);
}

.lb-mode__label {
  display: block;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.3;
}

.lb-question {
  font-weight: 500;
  line-height: 1.5;
}

.lb-choice {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  padding: 0.4rem 1.1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.lb-choice:hover {
  border-color: var(--color-accent);
}

.lb-choice[data-selected="true"] {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  font-weight: 500;
}

/* The focus ring has to come from the visually-hidden radio inside. */
.lb-choice:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.lb-why {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  padding-left: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--theme-muted);
}

.lb-result {
  border: 1px solid var(--theme-border);
  border-left: 3px solid var(--theme-muted);
  border-radius: var(--radius-md);
  background: var(--theme-surface);
  padding: clamp(1.25rem, 4vw, 2rem);
}

.lb-result[data-level="low"] {
  border-left-color: var(--color-accent);
}

.lb-result[data-level="caution"] {
  border-left-color: #c58a2e;
}

.lb-result[data-level="high"] {
  border-left-color: #c2553f;
}

.lb-result__level {
  margin-top: 0.5rem;
  font-size: clamp(1.6rem, 1.2rem + 1.4vw, 2.4rem);
  font-weight: 350;
  line-height: 1.1;
}

.lb-steps {
  display: grid;
  gap: 0.85rem;
  counter-reset: lb-step;
  font-size: 0.95rem;
  line-height: 1.6;
}

.lb-steps li {
  position: relative;
  padding-left: 2rem;
  counter-increment: lb-step;
}

.lb-steps li::before {
  content: counter(lb-step);
  position: absolute;
  left: 0;
  top: 0.1em;
  display: grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 999px;
  border: 1px solid var(--theme-border);
  font-size: 0.72rem;
  color: var(--theme-muted);
}

.lb-heuristic {
  border-top: 1px solid var(--theme-border);
  padding-top: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--theme-muted);
}

.lb-button {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--theme-border);
  padding: 0.55rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.lb-button:hover {
  border-color: var(--color-accent);
}
</style>
