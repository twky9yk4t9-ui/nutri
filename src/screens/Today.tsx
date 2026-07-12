import { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { fmtShort, todayISO } from '../domain/dates'
import { ingredientMap, plannedMacros, recipeMap } from '../domain/macros'
import { weightOn } from '../domain/weights'
import { generateTarget, planFor, sessionCookingOn, slotsOn, tasksOn } from '../state/selectors'
import { GenerateSheet } from '../components/GenerateSheet'
import { SlotCard, type SlotVariant } from '../components/SlotCard'
import { SessionCard } from '../components/SessionCard'
import { Num } from '../components/Num'
import { IconSnow } from '../components/icons'

function WeightQuickAdd({ date }: { date: string }) {
  const { state, dispatch } = useApp()
  const existing = weightOn(state.weights, date)
  const [value, setValue] = useState('')

  const save = () => {
    const kg = Number(value.replace(',', '.'))
    if (!Number.isFinite(kg) || kg < 20 || kg > 300) return
    dispatch({ type: 'upsertWeight', entry: { dateISO: date, kg } })
    setValue('')
  }

  return (
    <div className="card" style={{ padding: '4px 12px' }}>
      <div className="row-between" style={{ minHeight: 48 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="small dim" style={{ fontWeight: 600 }}>
            Morning weight
          </span>
          {existing && (
            <span>
              <Num v={existing.kg.toFixed(1)} u="kg" />
              <span className="tiny" style={{ color: 'var(--accent)', marginLeft: 4 }}>
                ✓
              </span>
            </span>
          )}
        </div>
        <div className="row">
          <input
            inputMode="decimal"
            placeholder={existing ? existing.kg.toFixed(1) : 'kg'}
            style={{ width: 84, textAlign: 'right', minHeight: 40 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            aria-label="Weight in kilograms"
          />
          <button className="btn" style={{ minHeight: 40, padding: '4px 12px' }} onClick={save} disabled={!value.trim()}>
            Save
          </button>
        </div>
      </div>
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
  const t = state.settings.targets

  // The next actionable slot is dominant; everything logged compresses.
  const nextKey = slots.find((s) => s.status === 'planned')?.slot

  const variantFor = (status: string, slotKey: string): SlotVariant =>
    status !== 'planned' ? 'done' : slotKey === nextKey ? 'hero' : 'row'

  return (
    <>
      <h1 className="screen-title">Today</h1>
      <p className="screen-sub">
        {fmtShort(today)}
        {slots.length > 0 && (
          <>
            <span style={{ margin: '0 8px', color: 'var(--line-strong)' }}>·</span>
            <Num v={Math.round(dayMacros.kcal)} u="kcal" /> <Num v={Math.round(dayMacros.p)} u="P" />{' '}
            <Num v={Math.round(dayMacros.c)} u="C" /> <Num v={Math.round(dayMacros.f)} u="F" />
            <br />
            <span className="tiny faint">
              target {t.kcal} kcal · {t.p} P · {t.cMin}–{t.cMax} C · {t.fMin}–{t.fMax} F
            </span>
          </>
        )}
      </p>

      <WeightQuickAdd date={today} />

      {tasks.map((task) => (
        <div className="banner" key={task}>
          <span className="banner-icon">
            <IconSnow size={18} />
          </span>
          <span>{task}</span>
        </div>
      ))}

      {cookSession && (
        <SessionCard
          plan={plan!}
          session={cookSession}
          recipe={recipes.get(cookSession.recipeId)}
          highlight={!cookSession.done}
        />
      )}

      {slots.length === 0 ? (
        <div className="card center" style={{ padding: '28px 16px' }}>
          <div className="card-title">No plan covers today</div>
          <p className="dim small">Generate the week — pick 4 cook sessions and your snacks, get the grocery list.</p>
          <button className="btn btn-accent btn-block" onClick={() => setShowGenerate(true)}>
            Generate week
          </button>
        </div>
      ) : (
        slots.map((slot) => (
          <SlotCard
            key={slot.slot}
            slot={slot}
            recipe={recipes.get(slot.recipeId)}
            ingredients={ingredients}
            variant={variantFor(slot.status, slot.slot)}
          />
        ))
      )}

      {showGenerate && (
        <GenerateSheet satISO={target.satISO} replaces={target.replaces} onClose={() => setShowGenerate(false)} />
      )}
    </>
  )
}
