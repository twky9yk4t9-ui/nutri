import type { CSSProperties, ReactNode } from 'react'
import type { SupplementKey } from '../domain/types'
import { useApp } from '../state/store'
import { IconCheck, IconFish, IconFlask, IconPill, IconSun } from './icons'

// Daily supplements checklist (v4): display/logging only — no reminders, no
// advice. A date with no entry reads as all-unchecked, so it resets itself
// every morning. One row of circular toggles — same visual language as the
// day dots above it.

const ITEMS: { key: SupplementKey; name: string; color: string; icon: ReactNode }[] = [
  { key: 'creatine', name: 'Creatine', color: 'var(--purple)', icon: <IconFlask size={21} /> },
  { key: 'omega3', name: 'Omega-3', color: 'var(--blue)', icon: <IconFish size={21} /> },
  { key: 'vitaminD3', name: 'Vitamin D3', color: 'var(--yellow)', icon: <IconSun size={21} /> },
]

export function SupplementsCard({ date }: { date: string }) {
  const { state, dispatch } = useApp()
  const day = state.supplementsLog[date] ?? { creatine: false, omega3: false, vitaminD3: false }
  const done = ITEMS.filter((i) => day[i.key]).length

  return (
    <div className="card" style={{ padding: '10px 18px 2px' }}>
      <div className="widget-head">
        <span className="icon-chip sm" style={{ '--chip': 'var(--mint)' } as CSSProperties}>
          <IconPill size={15} />
        </span>
        <span className="group-label" style={{ flex: 1 }}>
          Supplements
        </span>
        <span className="tiny" style={{ color: done === ITEMS.length ? 'var(--green)' : 'var(--faint)', fontWeight: 700 }}>
          {done}/{ITEMS.length}
        </span>
      </div>
      <div className="row" style={{ gap: 4 }}>
        {ITEMS.map((item) => {
          const checked = day[item.key]
          return (
            <button
              key={item.key}
              className="supp-toggle"
              style={{ '--c': item.color } as CSSProperties}
              onClick={() => dispatch({ type: 'toggleSupplement', date, key: item.key })}
              aria-pressed={checked}
              aria-label={`${item.name}: ${checked ? 'taken' : 'not taken'}. Tap to toggle.`}
            >
              <span className="supp-circle" aria-hidden>
                {item.icon}
                {checked && (
                  <span className="supp-badge pop-in">
                    <IconCheck size={12} />
                  </span>
                )}
              </span>
              <span className="supp-label">{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
