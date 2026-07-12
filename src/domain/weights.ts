import type { WeightEntry } from './types'
import { addDays, mondayOf } from './dates'

// §7 weight: one entry per date (kg, 1 decimal, mornings assumed).
// Display only in v1 — no interpretation, no suggestions. The rolling and
// weekly averages computed here are exactly what the v1.1 calibration engine
// will consume (§11.1); nothing here proposes anything.

export function upsertWeight(weights: WeightEntry[], entry: WeightEntry): WeightEntry[] {
  const kg = Math.round(entry.kg * 10) / 10
  const rest = weights.filter((w) => w.dateISO !== entry.dateISO)
  return [...rest, { dateISO: entry.dateISO, kg }].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
}

export function deleteWeight(weights: WeightEntry[], dateISO: string): WeightEntry[] {
  return weights.filter((w) => w.dateISO !== dateISO)
}

export function weightOn(weights: WeightEntry[], dateISO: string): WeightEntry | undefined {
  return weights.find((w) => w.dateISO === dateISO)
}

/**
 * Trailing 7-day rolling average: for each entry date, the mean of entries in
 * [date−6, date]. Sparse-friendly — averages whatever exists in the window.
 */
export function rolling7(weights: WeightEntry[]): { dateISO: string; kg: number }[] {
  const sorted = [...weights].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  return sorted.map((entry) => {
    const from = addDays(entry.dateISO, -6)
    const window = sorted.filter((w) => w.dateISO >= from && w.dateISO <= entry.dateISO)
    const mean = window.reduce((s, w) => s + w.kg, 0) / window.length
    return { dateISO: entry.dateISO, kg: Math.round(mean * 100) / 100 }
  })
}

/** Weekly (Mon–Sun, §1) averages of raw entries. */
export function weeklyAverages(weights: WeightEntry[]): { mondayISO: string; kg: number; count: number }[] {
  const buckets = new Map<string, { sum: number; count: number }>()
  for (const w of weights) {
    const monday = mondayOf(w.dateISO)
    const b = buckets.get(monday) ?? { sum: 0, count: 0 }
    b.sum += w.kg
    b.count += 1
    buckets.set(monday, b)
  }
  return [...buckets.entries()]
    .map(([mondayISO, { sum, count }]) => ({ mondayISO, kg: Math.round((sum / count) * 100) / 100, count }))
    .sort((a, b) => a.mondayISO.localeCompare(b.mondayISO))
}
