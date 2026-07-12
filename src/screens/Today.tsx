import { useMemo, useState } from 'react'
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
import { Num } from '../components/Num'
import { IconBowl, IconPlus, IconScale, IconSnow } from '../components/icons'

/** Five segments, one per slot — fills as the day is logged. Teaches the app with zero words. */
function DayProgress({ slots }: { slots: PlanSlot[] }) {
  return (
    <div className="progress-track" role="img" aria-label={`${slots.filter((s) => s.status === 'eaten').length} of ${slots.length} meals eaten`}>
      {slots.map((s) => (
        <span key={s.slot} className={`progress-seg${s.status !== 'planned' ? ` ${s.status}` : ''}`} />
      ))}
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
        <span className="row-icon">
          <IconScale size={18} />
        </span>
        <span style={{ flex: 1, fontWeight: 600 }}>Weight</span>
        {existing ? (
          <span>
            <Num v={existing.kg.toFixed(1)} u="kg" /> <span className="tiny" style={{ color: 'var(--accent)' }}>✓</span>
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

  const dayMacros = useMemo(() => plannedMacros(slots.map((s) => s.recipeId), recipes), [slots, recipes])
  const nextKey = slots.find((s) => s.status === 'planned')?.slot
  const variantFor = (slot: PlanSlot): SlotVariant =>
    slot.status !== 'planned' ? 'done' : slot.slot === nextKey ? 'hero' : 'row'

  return (
    <>
      <ScreenHeader
        title="Today"
        sub={
          <>
            {fmtShort(today)}
            {slots.length > 0 && (
              <>
                {'  ·  '}
                <Num v={Math.round(dayMacros.kcal)} u="kcal" /> <Num v={Math.round(dayMacros.p)} u="P" />
              </>
            )}
          </>
        }
      />

      {slots.length > 0 && <DayProgress slots={slots} />}

      <WeightRow date={today} />

      {tasks.map((task) => (
        <div className="banner" key={task}>
          <span className="banner-icon">
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
