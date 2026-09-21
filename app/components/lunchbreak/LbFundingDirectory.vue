<!--
  Funding Directory.

  Every entry, every tradeoff line and every date comes from
  content/lunch-break/funding.yml. This component filters, sorts and renders,
  and decides nothing about the money.

  The one piece of real logic is the deadline. A directory of grants goes stale
  the way milk does, and a static site rebuilt three times a year would happily
  show a January deadline all summer. So "has this closed?" is answered against
  the visitor's clock, not the build's — see `now` below.
-->

<template>
  <div class="space-y-12">
    <!-- --- Legend ------------------------------------------------------ -->
    <section aria-labelledby="lb-legend-heading" class="space-y-4">
      <h2 id="lb-legend-heading" class="lb-heading">Four kinds of money</h2>

      <dl class="grid gap-3 sm:grid-cols-2">
        <div v-for="entry in data.legend" :key="entry.type" class="surface-card p-4">
          <dt class="flex flex-wrap items-center gap-3">
            <span class="lb-type-pill" :data-type="entry.type">{{ entry.label }}</span>
            <span class="label-text muted-text">{{ countByType(entry.type) }} listed</span>
          </dt>
          <dd class="mt-2 text-sm leading-relaxed muted-text">
            {{ entry.blurb }}
            <NuxtLink
              v-if="entry.articleAnchor"
              :to="`${articlePath}${entry.articleAnchor}`"
              class="lb-inline-link"
            >
              More →
            </NuxtLink>
          </dd>
        </div>
      </dl>
    </section>

    <!-- --- Filters ----------------------------------------------------- -->
    <section aria-labelledby="lb-filters-heading" class="lb-no-print space-y-4">
      <h2 id="lb-filters-heading" class="label-text">Narrow it down</h2>

      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <label for="lb-filter-type" class="lb-field-label">Type</label>
          <select id="lb-filter-type" v-model="filterType" class="lb-select">
            <option value="all">All types</option>
            <option v-for="entry in data.legend" :key="entry.type" :value="entry.type">
              {{ entry.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="lb-filter-region" class="lb-field-label">Region</label>
          <select id="lb-filter-region" v-model="filterRegion" class="lb-select">
            <option value="all">Anywhere</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>

        <div>
          <label for="lb-sort" class="lb-field-label">Sort by</label>
          <select id="lb-sort" v-model="sortBy" class="lb-select">
            <option value="deadline">Next deadline</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <label class="lb-toggle">
        <input v-model="showClosed" type="checkbox" class="lb-check">
        <span>Show programmes whose deadline has passed</span>
      </label>
    </section>

    <!-- --- Entries ----------------------------------------------------- -->
    <section aria-labelledby="lb-entries-heading" class="space-y-5">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="lb-entries-heading" class="lb-heading">
          {{ visible.length }} {{ visible.length === 1 ? 'option' : 'options' }}
        </h2>
        <p v-if="hiddenClosedCount" class="text-sm muted-text lb-no-print">
          {{ hiddenClosedCount }} closed
        </p>
      </div>

      <p v-if="!visible.length" class="surface-card p-5 text-sm leading-relaxed muted-text">
        Nothing in the directory matches that yet. This is a hand-checked list
        rather than a scrape, so it is short on purpose — if you know something
        that belongs here, send it over.
      </p>

      <ul class="space-y-4 lb-print-urls">
        <li
          v-for="entry in visible"
          :key="entry.name"
          class="surface-card lb-print-block space-y-4 p-5 sm:p-6"
        >
          <header class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span class="lb-type-pill" :data-type="entry.type">{{ typeLabel(entry.type) }}</span>
              <span class="label-text muted-text">{{ entry.region }}</span>
              <span v-if="entry.repay" class="lb-repay">Repaid from your income</span>
            </div>

            <h3 class="lb-entry-title">
              <a :href="entry.url" target="_blank" rel="noopener">{{ entry.name }}</a>
            </h3>

            <p class="lb-amount">{{ entry.amount }}</p>
          </header>

          <dl class="space-y-3 text-sm leading-relaxed">
            <div>
              <dt class="lb-tag">Who it's for</dt>
              <dd class="muted-text">{{ entry.eligibility }}</dd>
            </div>
            <div>
              <dt class="lb-tag">The catch</dt>
              <dd>{{ entry.tradeoff }}</dd>
            </div>
            <div>
              <dt class="lb-tag">Deadline</dt>
              <dd :class="deadlineOf(entry).closed ? 'lb-closed' : 'muted-text'">
                {{ deadlineOf(entry).label }}
              </dd>
            </div>
          </dl>

          <p v-if="entry.verifyNote" class="lb-caution">
            {{ entry.verifyNote }}
          </p>

          <footer class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-theme pt-4">
            <a :href="entry.url" target="_blank" rel="noopener" class="lb-external">
              Apply / read more ↗
            </a>
            <a
              v-if="entry.sourceUrl !== entry.url"
              :href="entry.sourceUrl"
              target="_blank"
              rel="noopener"
              class="lb-external lb-external--muted"
            >
              Source ↗
            </a>
            <LbLastVerified :date="entry.lastVerified" />
          </footer>
        </li>
      </ul>
    </section>

    <div class="lb-no-print flex flex-wrap items-center gap-4 border-t border-theme pt-8">
      <button type="button" class="lb-button" @click="print">Print this list</button>
      <LbFeedbackLink
        page="Funding Directory"
        prompt="Know a fund that belongs here, or one that has closed?"
        link-label="Suggest a resource"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { lunchBreakArticlePath, findToolBySlug } from '~~/shared/lunch-break/config'

interface FundingEntry {
  name: string
  type: string
  region: string
  amount: string
  eligibility: string
  deadline: string
  reopens?: string
  repay: boolean
  tradeoff: string
  url: string
  sourceUrl: string
  lastVerified: string
  verifyNote?: string
}

interface LegendEntry {
  type: string
  label: string
  blurb: string
  articleAnchor?: string
}

const props = defineProps<{
  data: {
    legend: LegendEntry[]
    entries: FundingEntry[]
  }
}>()

const articlePath = computed(() =>
  lunchBreakArticlePath(findToolBySlug('funding')?.pairedArticle ?? ''),
)

const filterType = ref('all')
const filterRegion = ref('all')
const sortBy = ref<'deadline' | 'name'>('deadline')
const showClosed = ref(false)

/*
 * The visitor's clock, not the build's.
 *
 * It starts null so the first client render is identical to the prerendered
 * HTML — anything else is a hydration mismatch on a page that ships as one
 * shared document to everybody. `onMounted` then fills it in and every
 * deadline re-evaluates against today. Crawlers and no-JS readers see the list
 * with its real dates and nothing hidden, which is the right fallback.
 */
const now = ref<number | null>(null)

onMounted(() => {
  now.value = Date.now()
})

/** Local midnight for an ISO date, so a deadline is live all of its last day. */
const parseIsoDate = (value: string): number | null => {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) {
    return null
  }
  const [, year, month, day] = matched
  return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59).getTime()
}

const formatIso = (value: string) => {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) {
    return value
  }
  const [, year, month, day] = matched
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface DeadlineView {
  closed: boolean
  label: string
  /** Sort key: soonest real deadline first, rolling next, closed last. */
  sortKey: number
}

const ROLLING_SORT_KEY = Number.MAX_SAFE_INTEGER - 1_000_000
const CLOSED_SORT_KEY = Number.MAX_SAFE_INTEGER

const deadlineOf = (entry: FundingEntry): DeadlineView => {
  const raw = entry.deadline.trim()

  if (raw.toLowerCase() === 'rolling') {
    return { closed: false, label: 'Rolling — apply any time', sortKey: ROLLING_SORT_KEY }
  }

  const timestamp = parseIsoDate(raw)

  // Not a date at all ("See site — runs in cycles through the year"). Print it
  // as written; it cannot be closed because it never claimed to be open.
  if (timestamp === null) {
    return { closed: false, label: raw, sortKey: ROLLING_SORT_KEY }
  }

  const reference = now.value
  if (reference === null || timestamp >= reference) {
    return { closed: false, label: formatIso(raw), sortKey: timestamp }
  }

  return {
    closed: true,
    label: entry.reopens
      ? `Closed — typically reopens ${entry.reopens}`
      : 'Closed',
    sortKey: CLOSED_SORT_KEY,
  }
}

/*
 * A closed entry with no known reopening month is hidden outright rather than
 * shown greyed out: it is a dead link to an artist, and a directory that shows
 * more closed programmes than open ones stops being useful.
 */
const isHidden = (entry: FundingEntry) => deadlineOf(entry).closed && !entry.reopens

const matchesFilters = (entry: FundingEntry) =>
  (filterType.value === 'all' || entry.type === filterType.value)
  && (filterRegion.value === 'all' || entry.region === filterRegion.value)

const filtered = computed(() => props.data.entries.filter(matchesFilters))

const visible = computed(() => {
  const list = filtered.value.filter((entry) => {
    if (isHidden(entry)) {
      return showClosed.value
    }
    return showClosed.value || !deadlineOf(entry).closed
  })

  return [...list].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    const diff = deadlineOf(a).sortKey - deadlineOf(b).sortKey
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })
})

const hiddenClosedCount = computed(() =>
  showClosed.value ? 0 : filtered.value.filter((entry) => deadlineOf(entry).closed).length,
)

const regions = computed(() =>
  [...new Set(props.data.entries.map((entry) => entry.region))].sort((a, b) => a.localeCompare(b)),
)

const countByType = (type: string) =>
  props.data.entries.filter((entry) => entry.type === type).length

const typeLabel = (type: string) =>
  props.data.legend.find((entry) => entry.type === type)?.label ?? type

const print = () => {
  if (import.meta.client) {
    window.print()
  }
}
</script>

<style scoped>
.lb-heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}

.lb-entry-title {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  line-height: 1.25;
}

.lb-entry-title a:hover {
  color: var(--color-accent);
}

.lb-amount {
  font-size: 1.05rem;
  color: var(--color-accent);
}

.lb-tag {
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-accent) 80%, var(--theme-muted));
}

/*
 * One pill shape, tinted per type. Hue rather than shape because the types are
 * peers — none of them is the recommended one, and a "primary" style would
 * imply otherwise.
 */
.lb-type-pill {
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  border-radius: 999px;
  padding: 0.15rem 0.7rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.lb-type-pill[data-type="advance"],
.lb-type-pill[data-type="loan"] {
  border-color: color-mix(in srgb, #c2553f 45%, transparent);
  background: color-mix(in srgb, #c2553f 12%, transparent);
}

.lb-type-pill[data-type="emergency"] {
  border-color: color-mix(in srgb, var(--theme-muted) 45%, transparent);
  background: color-mix(in srgb, var(--theme-muted) 12%, transparent);
}

.lb-repay {
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c2553f;
}

.lb-closed {
  color: #c2553f;
}

.lb-caution {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  padding-left: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--theme-muted);
}

.lb-external {
  font-size: 0.875rem;
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.lb-external--muted {
  color: var(--theme-muted);
}

.lb-inline-link {
  color: var(--color-accent);
  white-space: nowrap;
}

.lb-field-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.lb-select {
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-sm);
  background: var(--theme-bg);
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  color: inherit;
}

.lb-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  color: var(--theme-muted);
  cursor: pointer;
}

.lb-check {
  height: 1.05rem;
  width: 1.05rem;
  accent-color: var(--color-accent);
  cursor: pointer;
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
