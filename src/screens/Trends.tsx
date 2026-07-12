import { useState } from 'react'
import { todayISO, fmtShort } from '../domain/dates'
import { lastNWeeks } from '../domain/adherence'
import { rolling7 } from '../domain/weights'
import { useApp } from '../state/store'
import { WeightChart } from '../components/WeightChart'
import { Num } from '../components/Num'

// §9.5 Trends — the chart gets the space; numbers annotate it. Display only
// (§7): no interpretation, no suggestions, no trend-colored arrows.

function WeightRow({ dateISO, kg }: { dateISO: string; kg: number }) {
  const { dispatch } = useApp()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(kg.toFixed(1))

  const save = () => {
    const parsed = Number(value.replace(',', '.'))
    if (Number.isFinite(parsed) && parsed >= 20 && parsed <= 300) {
      dispatch({ type: 'upsertWeight', entry: { dateISO, kg: parsed } })
      setEditing(false)
    }
  }

  return (
    <li className="dataline">
      <span className="small dim">{fmtShort(dateISO)}</span>
      {editing ? (
        <span className="row">
          <input
            inputMode="decimal"
            style={{ width: 84, textAlign: 'right', minHeight: 40 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            aria-label={`Weight on ${dateISO}`}
          />
          <button className="btn" style={{ minHeight: 40, padding: '4px 10px' }} onClick={save}>
            Save
          </button>
        </span>
      ) : (
        <span className="row" style={{ gap: 4 }}>
          <Num v={kg.toFixed(1)} u="kg" />
          <button
            className="btn btn-ghost small"
            style={{ minHeight: 40, padding: '4px 8px', color: 'var(--blue)' }}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="btn btn-ghost small"
            style={{ minHeight: 40, padding: '4px 8px', color: 'var(--red)' }}
            onClick={() => dispatch({ type: 'deleteWeight', dateISO })}
          >
            Delete
          </button>
        </span>
      )}
    </li>
  )
}

export function Trends() {
  const { state } = useApp()
  const today = todayISO()
  const bars = lastNWeeks(state.weeks, 8, today)
  const sorted = [...state.weights].sort((a, b) => b.dateISO.localeCompare(a.dateISO))
  const recent = sorted.slice(0, 14)
  const latest = sorted[0]
  const roll = rolling7(state.weights)
  const latestRoll = roll[roll.length - 1]

  return (
    <>
      <h1 className="screen-title">Trends</h1>
      <p className="screen-sub">Display only — the app never adjusts targets.</p>

      <div className="card" style={{ padding: '12px 8px 8px' }}>
        <div className="row-between" style={{ padding: '0 8px 8px' }}>
          <div className="card-title">Weight</div>
          {latest && (
            <span className="small dim">
              latest <Num v={latest.kg.toFixed(1)} u="kg" />
              {latestRoll && (
                <>
                  {' '}
                  · 7-day <Num v={latestRoll.kg.toFixed(1)} u="kg" />
                </>
              )}
            </span>
          )}
        </div>
        <WeightChart weights={state.weights} />
      </div>

      <div className="card">
        <div className="row-between">
          <div className="card-title">Weekly adherence</div>
          <span className="tiny faint">weeks start Monday</span>
        </div>
        <div className="tiny faint" style={{ marginBottom: 8 }}>
          % of slots eaten · cook sessions done below
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 96 }}>
          {bars.map((b) => {
            const pct = b.adherence.pct
            return (
              <div key={b.mondayISO} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                {pct === null ? (
                  <div style={{ height: 3, borderRadius: 2, background: 'var(--line)' }} aria-label={`Week of ${b.mondayISO}: no plan`} />
                ) : (
                  <div
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      borderRadius: 4,
                      background: 'var(--accent)',
                      opacity: 0.4 + 0.6 * (pct / 100),
                    }}
                    aria-label={`Week of ${b.mondayISO}: ${pct}% adherence`}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {bars.map((b) => (
            <div key={b.mondayISO} className="tiny faint center" style={{ flex: 1 }}>
              {b.adherence.pct !== null ? `${b.adherence.pct}%` : '·'}
              <br />
              {b.sessions.total > 0 ? `${b.sessions.done}/${b.sessions.total}` : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Entries</div>
        <ul className="list-plain" style={{ marginTop: 4 }}>
          {recent.length === 0 && <li className="dim small">Nothing logged yet.</li>}
          {recent.map((w) => (
            <WeightRow key={w.dateISO} dateISO={w.dateISO} kg={w.kg} />
          ))}
        </ul>
      </div>
    </>
  )
}
