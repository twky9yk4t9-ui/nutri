import type { CSSProperties, ReactNode } from 'react'
import type { SupplementKey } from '../domain/types'
import { useApp } from '../state/store'
import { IconCheck, IconFish, IconFlask, IconPill, IconSun } from './icons'

// Daily supplements checklist (v4): display/logging only — no reminders, no
// advice. A date with no entry reads as all-unchecked, so it resets itself
// every morning.

const ITEMS: { key: SupplementKey; name: string; color: string; icon: ReactNode }[] = [
  { key: 'creatine', name: 'Creatine', color: 'var(--purple)', icon: <IconFlask size={16} /> },
  { key: 'omega3', name: 'Omega-3', color: 'var(--blue)', icon: <IconFish size={16} /> },
  { key: 'vitaminD3', name: 'Vitamin D3', color: 'var(--yellow)', icon: <IconSun size={16} /> },
]

export function SupplementsCard({ date }: { date: string }) {
  const { state, dispatch } = useApp()
  const day = state.supplementsLog[date] ?? { creatine: false, omega3: false, vitaminD3: false }
  const done = ITEMS.filter((i) => day[i.key]).length

  return (
    <div className="card" style={{ padding: '10px 18px 4px' }}>
      <div className="widget-head">
        <span className="icon-chip sm" style={{ '--chip': 'var(--mint)' } as CSSProperties}>
          <IconPill size={15} />
        </span>
        <span className="group-label" style={{ flex: 1 }}>
          Supplements
        </span>
        <span className="tiny" style={{ color: done === ITEMS.length ? 'var(--green)' : 'var(--faint)' }}>
          {done}/{ITEMS.length}
        </span>
      </div>
      {ITEMS.map((item) => {
        const checked = day[item.key]
        return (
          <button
            key={item.key}
            className="check-row supp-row"
            onClick={() => dispatch({ type: 'toggleSupplement', date, key: item.key })}
            aria-pressed={checked}
          >
            <span className="check-box" aria-hidden>
              {checked && (
                <span className="pop-in">
                  <IconCheck size={15} />
                </span>
              )}
            </span>
            <span style={{ color: item.color, opacity: 0.85, display: 'inline-flex' }} aria-hidden>
              {item.icon}
            </span>
            <span className="check-label" style={{ flex: 1, fontWeight: 600 }}>
              {item.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
