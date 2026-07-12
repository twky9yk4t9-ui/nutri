import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { PlanSlot } from '../domain/types'
import { useApp } from '../state/store'
import { fmtShort, todayISO } from '../domain/dates'
import { ingredientMap, plannedMacros, recipeMap } from '../domain/macros'
import { weightOn } from '../domain/weights'
import { generateTarget, planFor, sessionCookingOn, slotsOn, tasksOn } from '../state/selectors'
import { GenerateSheet } from '../components/GenerateSheet'
import { ScreenHeader } from '../components/ScreenHeader'
import { SlotCard, type SlotVariant } from '../components/SlotCard'
import { SessionCard } from '../components/SessionCard'
import { SLOT_GLYPH } from '../components/foodGlyph'
import { Num } from '../components/Num'
import { IconBowl, IconPlus, IconScale, IconSnow } from '../components/icons'

/** One circle per slot (widget week-row style): ✓ eaten, – off-plan,
 *  ring = up next. The slot glyph beneath names it without words. */
function DayDots({ slots }: { slots: PlanSlot[] }) {
  const nextKey = slots.find((s) => s.status === 'planned')?.slot
  return (
    <div
      className="row"
      style={{ gap: 4, alignItems: 'flex-start' }}
      role="img"
      aria-label={`${slots.filter((s) => s.status === 'eaten').length} of ${slots.length} meals eaten`}
    >
      {slots.map((s) => {
        const g = SLOT_GLYPH[s.slot]
        const cls = s.status !== 'planned' ? s.status : s.slot === nextKey ? 'next' : ''
        return (
          <span key={s.slot} className="daydot">
            <span className={`daydot-circle ${cls}`} aria-hidden>
              {s.status === 'eaten' ? '✓' : s.status === 'off-plan' ? '–' : ''}
            </span>
            <span className="daydot-label" style={{ color: g.color, opacity: 0.8 }} aria-hidden>
              {g.icon(13)}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** Eaten so far vs daily target — flat colored fill, no glow. */
function TargetBar({ value, target, unit, color }: { value: number; target: number; unit: string; color: string }) {
  const pct = target > 0 ? Math.round((value / target) * 100) : 0
  return (
    <div style={{ marginTop: 12 }}>
      <div className="row-between" style={{ alignItems: 'baseline', marginBottom: 5 }}>
        <span>
          <span className="num" style={{ fontSize: 20, fontWeight: 800 }}>
            {Math.round(value)}
          </span>
          <span className="unit">
            /{target} {unit}
          </span>
        </span>
        <span className="tiny" style={{ color, fontWeight: 700 }}>
          {pct}%
        </span>
      </div>
      <div className="bar" role="img" aria-label={`${Math.round(value)} of ${target} ${unit} eaten`}>
        <div className="bar-fill" style={{ width: `${Math.min(100, pct)}%`, '--bar-c': color } as CSSProperties} />
      </div>
    </div>
  )
}

/** One compact row; the input appears only on tap (progressive disclosure). */
function WeightRow({ date }: { date: string }) {
  const { state, dispatch } = useApp()
  const existing = weightOn(state.weights, date)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const save = () => {
    const kg = Number(value.replace(',', '.'))
    if (!Number.isFinite(kg) || kg < 20 || kg > 300) return
    dispatch({ type: 'upsertWeight', entry: { dateISO: date, kg } })
    setValue('')
    setOpen(false)
  }

  return (
    <div className="card" style={{ padding: '2px 14px' }}>
      <button className="row" style={{ width: '100%', minHeight: 52, textAlign: 'left' }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="icon-chip" style={{ '--chip': 'var(--purple)' } as CSSProperties}>
          <IconScale size={18} />
        </span>
        <span style={{ flex: 1, fontWeight: 600 }}>Weight</span>
        {existing ? (
          <span>
            <Num v={existing.kg.toFixed(1)} u="kg" /> <span className="tiny" style={{ color: 'var(--green)' }}>✓</span>
          </span>
        ) : (
          <span className="row dim small" style={{ gap: 4 }}>
            <IconPlus size={15} /> Log
          </span>
        )}
      </button>
      {open && (
        <div className="row" style={{ padding: '0 0 12px 44px', gap: 8 }}>
          <input
            inputMode="decimal"
            autoFocus
            placeholder={existing ? existing.kg.toFixed(1) : 'kg'}
            style={{ flex: 1, textAlign: 'right', minHeight: 44 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            aria-label="Weight in kilograms"
          />
          <button className="btn btn-accent" style={{ minHeight: 44 }} onClick={save} disabled={!value.trim()}>
            Save
          </button>
        </div>
      )}
    </div>
  )
}

export function Today() {
  const { state } = useApp()
  const today = todayISO()
  const plan = planFor(state, today)
  const recipes = useMemo(() => recipeMap(state.recipes), [state.recipes])
  const ingredients = useMemo(() => ingredientMap(state.ingredients), [state.ingredients])
  const [showGenerate, setShowGenerate] = useState(false)

  const slots = slotsOn(plan, today)
  const tasks = plan ? tasksOn(plan, today) : []
  const cookSession = sessionCookingOn(plan, today)
  const target = generateTarget(state, today)
  const targets = state.settings.targets

  const eaten = useMemo(
    () => plannedMacros(slots.filter((s) => s.status === 'eaten').map((s) => s.recipeId), recipes),
    [slots, recipes],
  )
  const nextKey = slots.find((s) => s.status === 'planned')?.slot
  const variantFor = (slot: PlanSlot): SlotVariant =>
    slot.status !== 'planned' ? 'done' : slot.slot === nextKey ? 'hero' : 'row'

  return (
    <>
      <ScreenHeader title="Today" sub={fmtShort(today)} />

      {slots.length > 0 && (
        <div className="card">
          <DayDots slots={slots} />
          <TargetBar value={eaten.kcal} target={targets.kcal} unit="kcal" color="var(--orange)" />
          <TargetBar value={eaten.p} target={targets.p} unit="g protein" color="var(--cyan)" />
        </div>
      )}

      <WeightRow date={today} />

      {tasks.map((task) => (
        <div className="banner" key={task}>
          <span className="banner-icon" style={{ color: 'var(--blue)' }}>
            <IconSnow size={18} />
          </span>
          <span>{task}</span>
        </div>
      ))}

      {cookSession && (
        <SessionCard plan={plan!} session={cookSession} recipe={recipes.get(cookSession.recipeId)} highlight={!cookSession.done} />
      )}

      {slots.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <IconBowl size={44} />
          </div>
          <p>Plan the week to see today's meals.</p>
          <button className="btn btn-accent" onClick={() => setShowGenerate(true)}>
            Generate week
          </button>
        </div>
      ) : (
        slots.map((slot) => (
          <SlotCard key={slot.slot} slot={slot} recipe={recipes.get(slot.recipeId)} ingredients={ingredients} variant={variantFor(slot)} />
        ))
      )}

      {showGenerate && <GenerateSheet satISO={target.satISO} replaces={target.replaces} onClose={() => setShowGenerate(false)} />}
    </>
  )
}
