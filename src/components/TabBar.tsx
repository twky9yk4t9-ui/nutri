import type { CSSProperties, ReactNode } from 'react'
import { IconGrocery, IconRecipes, IconToday, IconTrends, IconWeek } from './icons'

export type Tab = 'today' | 'week' | 'recipes' | 'grocery' | 'trends'

// Each tab lights up in its screen's identity color — the color you land on
// matches the color you tapped, which teaches the map without words.
const TABS: { id: Tab; label: string; color: string; icon: () => ReactNode }[] = [
  { id: 'today', label: 'Today', color: 'var(--orange)', icon: () => <IconToday /> },
  { id: 'week', label: 'Week', color: 'var(--green)', icon: () => <IconWeek /> },
  { id: 'recipes', label: 'Recipes', color: 'var(--mint)', icon: () => <IconRecipes /> },
  { id: 'grocery', label: 'Grocery', color: 'var(--cyan)', icon: () => <IconGrocery /> },
  { id: 'trends', label: 'Trends', color: 'var(--purple)', icon: () => <IconTrends /> },
]

export function TabBar({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${active === t.id ? ' active' : ''}`}
            style={{ '--tab-c': t.color } as CSSProperties}
            onClick={() => onSelect(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
          >
            {t.icon()}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
