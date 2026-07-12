import { useMemo, useState } from 'react'
import type { SessionId } from '../domain/types'
import { addDays, fmtDayMonth, fmtShort } from '../domain/dates'
import { ingredientMap, recipeMap } from '../domain/macros'
import {
  SESSION_SHAPES,
  generateCycle,
  proposeSessions,
  proposeSnackPick,
  validateSnackPick,
} from '../domain/rotation'
import { SALMON_RECIPE_ID } from '../domain/seed'
import { useApp } from '../state/store'
import { planByStart } from '../state/selectors'
import { Sheet } from './Sheet'

// §6.2: plan generation — the app proposes 4 recipes + a weekly snack pick;
// the user confirms or edits both on this sheet.

const SESSION_ORDER: SessionId[] = ['S4', 'S1', 'S2', 'S3'] // chronological within the cycle

export function GenerateSheet({
  satISO,
  replaces,
  onClose,
}: {
  satISO: string
  replaces: boolean
  onClose: () => void
}) {
  const { state, dispatch } = useApp()
  const mains = useMemo(() => state.recipes.filter((r) => r.slotType === 'main'), [state.recipes])
  const snackTemplates = useMemo(() => state.recipes.filter((r) => r.slotType === 'snack'), [state.recipes])
  const recipes = useMemo(() => recipeMap(state.recipes), [state.recipes])
  const prevPlan = planByStart(state, addDays(satISO, -7))

  const proposal = useMemo(() => proposeSessions(satISO, mains, prevPlan), [satISO, mains, prevPlan])
  const [sessions, setSessions] = useState<Record<SessionId, string>>(proposal)
  const salmonInPlan = Object.values(sessions).includes(SALMON_RECIPE_ID)

  const [snacksTouched, setSnacksTouched] = useState(false)
  const [pickState, setPickState] = useState<string[]>(() => proposeSnackPick(salmonInPlan))
  const pick = snacksTouched ? pickState : proposeSnackPick(salmonInPlan)
  const pickError = validateSnackPick(pick, salmonInPlan, (id) => recipes.get(id)?.verified.p ?? 0)

  const setSession = (id: SessionId, recipeId: string) => setSessions((s) => ({ ...s, [id]: recipeId }))

  const toggleSnack = (id: string) => {
    setSnacksTouched(true)
    setPickState((prev) => {
      const base = snacksTouched ? prev : pick
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    })
  }

  const confirm = () => {
    const plan = generateCycle(satISO, state.recipes, ingredientMap(state.ingredients), prevPlan, {
      sessionOverrides: sessions,
      snackPick: pick,
    })
    dispatch({ type: 'storePlan', plan })
    onClose()
  }

  return (
    <Sheet title="Generate week" onClose={onClose}>
      <p className="dim small" style={{ marginTop: 0 }}>
        Cycle {fmtShort(satISO)} → {fmtShort(addDays(satISO, 6))} · shop Saturday morning
      </p>

      {replaces && (
        <div className="banner">
          <span>
            A plan already exists for this cycle. Generating again replaces it — meal log and grocery ticks for the
            week are reset.
          </span>
        </div>
      )}

      <div className="grid-gap">
        {SESSION_ORDER.map((id) => {
          const shape = SESSION_SHAPES.find((s) => s.id === id)!
          const cookDate = addDays(satISO, shape.cookOffset)
          const coverDays = shape.coverOffsets.map((o) => fmtDayMonth(addDays(satISO, o))).join(' + ')
          const options = mains.filter((r) => (id === 'S2' ? r.tags.includes('quick') : true))
          const usedElsewhere = new Set(
            SESSION_ORDER.filter((other) => other !== id).map((other) => sessions[other]),
          )
          return (
            <div className="card mb0" key={id}>
              <div className="row-between">
                <div>
                  <div className="card-title">
                    {id} · {shape.day} <span className="dim">({fmtDayMonth(cookDate)})</span>
                  </div>
                  <div className="tiny dim">
                    {shape.portions} portions → {coverDays}
                    {id === 'S2' && ' · quick recipe only'}
                  </div>
                </div>
              </div>
              <select
                className="mt"
                style={{ width: '100%' }}
                value={sessions[id]}
                onChange={(e) => setSession(id, e.target.value)}
                aria-label={`Recipe for session ${id}`}
              >
                {options.map((r) => (
                  <option key={r.id} value={r.id} disabled={usedElsewhere.has(r.id)}>
                    {r.name}
                    {usedElsewhere.has(r.id) ? ' — already this week' : ''}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      <hr className="divider" />
      <div className="card-title" style={{ marginBottom: 8 }}>
        Snacks for the week
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {snackTemplates.map((s) => {
          const active = pick.includes(s.id)
          return (
            <button
              key={s.id}
              className={`chip ${active ? 'chip-accent' : ''}`}
              style={{ minHeight: 40, fontSize: 13 }}
              onClick={() => toggleSnack(s.id)}
              aria-pressed={active}
            >
              {s.name} · {recipes.get(s.id)!.verified.kcal} kcal
            </button>
          )
        })}
      </div>
      {pickError && (
        <p className="small mt" style={{ color: 'var(--amber)' }}>
          {pickError}
        </p>
      )}

      <button className="btn btn-accent btn-block mt" onClick={confirm} disabled={Boolean(pickError)}>
        {replaces ? 'Replace plan' : 'Confirm plan'}
      </button>
      <p className="footnote">
        Two snacks a day from your pick of 2–3 · max one Skyr snack (A′/B′/D′) per day · ≥20 g combined snack protein
        {salmonInPlan && ' · salmon days draw from B′/D′/F/G'}
      </p>
    </Sheet>
  )
}
