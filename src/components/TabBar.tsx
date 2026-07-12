import type { ReactNode } from 'react'
import { IconGrocery, IconRecipes, IconSettings, IconToday, IconTrends, IconWeek } from './icons'

export type Tab = 'today' | 'week' | 'recipes' | 'grocery' | 'trends' | 'settings'

const TABS: { id: Tab; label: string; icon: () => ReactNode }[] = [
  { id: 'today', label: 'Today', icon: () => <IconToday /> },
  { id: 'week', label: 'Week', icon: () => <IconWeek /> },
  { id: 'recipes', label: 'Recipes', icon: () => <IconRecipes /> },
  { id: 'grocery', label: 'Grocery', icon: () => <IconGrocery /> },
  { id: 'trends', label: 'Trends', icon: () => <IconTrends /> },
  { id: 'settings', label: 'Settings', icon: () => <IconSettings /> },
]

export function TabBar({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${active === t.id ? ' active' : ''}`}
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
