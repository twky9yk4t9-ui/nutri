import { useMemo, useState } from 'react'
import type { SessionId, SlotKey } from '../domain/types'
import { addDays, cycleDates, cycleSaturdayFor, dayName, fmtDayMonth, fmtShort, todayISO } from '../domain/dates'
import { cycleAdherence, sessionsDone } from '../domain/adherence'
import { recipeMap } from '../domain/macros'
import { useApp } from '../state/store'
import { planByStart, SLOT_LABELS, SLOT_ORDER } from '../state/selectors'
import { GenerateSheet } from '../components/GenerateSheet'
import { ScreenHeader } from '../components/ScreenHeader'
import { SessionChip } from '../components/SessionCard'
import { SwapSheet } from '../components/SwapSheet'
import { Num } from '../components/Num'
import { IconChevronLeft, IconChevronRight, IconWeek } from '../components/icons'

const SESSION_ORDER: SessionId[] = ['S4', 'S1', 'S2', 'S3']

export function Week() {
  const { state, dispatch } = useApp()
  const today = todayISO()
  const [cycleSat, setCycleSat] = useState(() => cycleSaturdayFor(today))
  const [showGenerate, setShowGenerate] = useState(false)
  const [swapping, setSwapping] = useState<SessionId | null>(null)

  const plan = planByStart(state, cycleSat)
  const recipes = useMemo(() => recipeMap(state.recipes), [state.recipes])
  const dates = cycleDates(cycleSat)
  const isCurrent = cycleSat === cycleSaturdayFor(today)

  const adherence = plan ? cycleAdherence(plan, today) : null
  const sessions = plan ? sessionsDone(plan) : null
  const showFreezerTip = plan && !state.flags?.freezerTipDismissed

  return (
    <>
      <ScreenHeader title="Week" />

      <div className="row-between" style={{ marginBottom: 10 }}>
        <button className="btn" style={{ minWidth: 48, padding: 0 }} onClick={() => setCycleSat(addDays(cycleSat, -7))} aria-label="Previous cycle">
          <IconChevronLeft size={18} />
        </button>
        <div className="center">
          <div style={{ fontWeight: 700 }}>
            {fmtDayMonth(cycleSat)} → {fmtDayMonth(addDays(cycleSat, 6))}
          </div>
          {isCurrent && (
            <span className="chip chip-accent tag" style={{ marginTop: 2 }}>
              current
            </span>
          )}
        </div>
        <div className="row" style={{ gap: 4 }}>
          {adherence && adherence.pct !== null && (
            <span className="center" style={{ marginRight: 4 }}>
              <span className="num num-lg">{adherence.pct}</span>
              <span className="unit">%</span>
              {sessions && (
                <div className="tiny faint">
                  <Num v={`${sessions.done}/${sessions.total}`} /> cooked
                </div>
              )}
            </span>
          )}
          <button className="btn" style={{ minWidth: 48, padding: 0 }} onClick={() => setCycleSat(addDays(cycleSat, 7))} aria-label="Next cycle">
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>

      {!plan ? (
        <div className="empty">
          <div className="empty-icon">
            <IconWeek size={44} />
          </div>
          <p>No plan for this cycle yet.</p>
          <button className="btn btn-accent" onClick={() => setShowGenerate(true)}>
            Generate this cycle
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 10 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '30px repeat(7, 1fr)',
                gap: 5,
                alignItems: 'stretch',
              }}
            >
              <div />
              {dates.map((d) => {
                const isToday = d === today
                return (
                  <div key={d} className="center" style={{ paddingBottom: 4 }}>
                    <div className="tiny" style={{ fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--dim)' }}>
                      {dayName(d)}
                    </div>
                    <div className="tiny faint">{fmtDayMonth(d).split(' ')[0]}</div>
                  </div>
                )
              })}
              {SLOT_ORDER.map((slotKey: SlotKey) => (
                <SlotGridRow key={slotKey} slotKey={slotKey} dates={dates} plan={plan} today={today} dispatch={dispatch} recipes={recipes} />
              ))}
            </div>
            <div className="row tiny faint" style={{ gap: 12, justifyContent: 'center', marginTop: 10 }}>
              <span className="row" style={{ gap: 4 }}>
                <Dot cls="" /> planned
              </span>
              <span className="row" style={{ gap: 4 }}>
                <Dot cls="eaten" /> eaten
              </span>
              <span className="row" style={{ gap: 4 }}>
                <Dot cls="off-plan" /> off-plan
              </span>
            </div>
          </div>

          <div className="group-label" style={{ margin: '14px 4px 8px' }}>
            Cook sessions
          </div>
          <div className="hscroll">
            {SESSION_ORDER.map((id) => {
              const session = plan.sessions.find((s) => s.id === id)!
              return (
                <SessionChip key={id} plan={plan} session={session} recipe={recipes.get(session.recipeId)} onSwap={() => setSwapping(id)} />
              )
            })}
          </div>

          {showFreezerTip && (
            <div className="banner">
              <span style={{ flex: 1 }}>When a session is easy, cook +1 portion and freeze it, until you hold 2–3 emergency meals.</span>
              <button
                className="btn btn-ghost small"
                style={{ minHeight: 36, padding: '2px 8px' }}
                onClick={() => dispatch({ type: 'dismissFreezerTip' })}
              >
                Dismiss
              </button>
            </div>
          )}

          <button className="btn btn-ghost btn-block" style={{ color: 'var(--dim)' }} onClick={() => setShowGenerate(true)}>
            Regenerate this cycle…
          </button>
        </>
      )}

      {showGenerate && <GenerateSheet satISO={cycleSat} replaces={Boolean(plan)} onClose={() => setShowGenerate(false)} />}
      {swapping && plan && <SwapSheet plan={plan} sessionId={swapping} onClose={() => setSwapping(null)} />}
    </>
  )
}

function Dot({ cls }: { cls: string }) {
  return (
    <span
      className={`grid-cell ${cls}`}
      style={{ minHeight: 12, width: 12, height: 12, borderRadius: 4, padding: 0, display: 'inline-block' }}
    />
  )
}

function SlotGridRow({
  slotKey,
  dates,
  plan,
  today,
  dispatch,
  recipes,
}: {
  slotKey: SlotKey
  dates: string[]
  plan: NonNullable<ReturnType<typeof planByStart>>
  today: string
  dispatch: ReturnType<typeof useApp>['dispatch']
  recipes: Map<string, { name: string }>
}) {
  return (
    <>
      <div className="tiny faint" style={{ alignSelf: 'center', fontWeight: 700 }}>
        {slotKey}
      </div>
      {dates.map((date) => {
        const slot = plan.slots.find((s) => s.date === date && s.slot === slotKey)
        if (!slot) return <div key={date} />
        return (
          <button
            key={date}
            className={`grid-cell ${slot.status === 'planned' ? '' : slot.status}${date === today ? ' today' : ''}`}
            style={{ minHeight: 54 }}
            onClick={() => dispatch({ type: 'cycleSlotStatus', date, slot: slotKey })}
            aria-label={`${fmtShort(date)} ${SLOT_LABELS[slotKey]}: ${recipes.get(slot.recipeId)?.name ?? slot.recipeId}, ${slot.status}. Tap to change.`}
          >
            {slot.status === 'eaten' && <span style={{ fontSize: 14, fontWeight: 800 }}>✓</span>}
            {slot.status === 'off-plan' && <span style={{ fontSize: 14, fontWeight: 800 }}>–</span>}
          </button>
        )
      })}
    </>
  )
}
