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
import { SLOT_GLYPH } from '../components/foodGlyph'
import { IconChevronLeft, IconChevronRight, IconPot, IconSnow, IconWeek } from '../components/icons'
import type { CSSProperties } from 'react'

const SESSION_ORDER: SessionId[] = ['S4', 'S1', 'S2', 'S3']

/** Activity-style adherence ring: one green figure, zero words. */
function Ring({ pct, sub }: { pct: number; sub?: string }) {
  const size = 52
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="center" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <svg width={size} height={size} role="img" aria-label={`${pct}% adherence`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--green)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 400ms var(--ease)' }}
        />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text)">
          {pct}
        </text>
      </svg>
      {sub && <span className="tiny faint">{sub}</span>}
    </span>
  )
}

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
        <div className="row" style={{ gap: 6 }}>
          {adherence && adherence.pct !== null && (
            <Ring pct={adherence.pct} sub={sessions ? `${sessions.done}/${sessions.total}` : undefined} />
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
          <div className="card" style={{ padding: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '32px repeat(7, 1fr)',
                gap: 4,
                alignItems: 'stretch',
              }}
            >
              <div />
              {dates.map((d) => {
                const isToday = d === today
                return (
                  <div key={d} className="center" style={{ paddingBottom: 4 }}>
                    <div className="tiny" style={{ fontWeight: 700, color: isToday ? 'var(--green)' : 'var(--dim)' }}>
                      {dayName(d)}
                    </div>
                    <div className="tiny" style={{ color: isToday ? 'var(--green)' : 'var(--faint)' }}>
                      {fmtDayMonth(d).split(' ')[0]}
                    </div>
                  </div>
                )
              })}
              {SLOT_ORDER.map((slotKey: SlotKey) => (
                <SlotGridRow key={slotKey} slotKey={slotKey} dates={dates} plan={plan} today={today} dispatch={dispatch} recipes={recipes} />
              ))}
            </div>
          </div>

          <div className="widget-head" style={{ margin: '6px 2px 4px' }}>
            <span className="icon-chip sm" style={{ '--chip': 'var(--orange)' } as CSSProperties}>
              <IconPot size={15} />
            </span>
            <span className="group-label">Cook sessions</span>
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
              <span className="banner-icon">
                <IconSnow size={17} />
              </span>
              <span style={{ flex: 1 }}>Cook +1 portion when easy — build a 2–3 meal freezer buffer.</span>
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
          <p className="footnote center">Tap a circle to log — ✓ eaten · – off-plan</p>
        </>
      )}

      {showGenerate && <GenerateSheet satISO={cycleSat} replaces={Boolean(plan)} onClose={() => setShowGenerate(false)} />}
      {swapping && plan && <SwapSheet plan={plan} sessionId={swapping} onClose={() => setSwapping(null)} />}
    </>
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
  const g = SLOT_GLYPH[slotKey]
  return (
    <>
      <div style={{ alignSelf: 'center', color: g.color, opacity: 0.85, display: 'inline-flex', justifyContent: 'center' }} title={SLOT_LABELS[slotKey]}>
        {g.icon(15)}
      </div>
      {dates.map((date) => {
        const slot = plan.slots.find((s) => s.date === date && s.slot === slotKey)
        if (!slot) return <div key={date} />
        const isToday = date === today
        const cls = slot.status !== 'planned' ? slot.status : isToday ? 'next' : ''
        return (
          <button
            key={date}
            className="cell-tap"
            onClick={() => dispatch({ type: 'cycleSlotStatus', date, slot: slotKey })}
            aria-label={`${fmtShort(date)} ${SLOT_LABELS[slotKey]}: ${recipes.get(slot.recipeId)?.name ?? slot.recipeId}, ${slot.status}. Tap to change.`}
          >
            <span className={`daydot-circle ${cls}`} aria-hidden>
              {slot.status === 'eaten' ? '✓' : slot.status === 'off-plan' ? '–' : ''}
            </span>
          </button>
        )
      })}
    </>
  )
}
