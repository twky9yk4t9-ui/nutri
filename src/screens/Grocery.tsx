import { useMemo } from 'react'
import type { GroceryItem, GroceryList } from '../domain/grocery'
import { buildGroceryList } from '../domain/grocery'
import { addDays, fmtDayMonth, fmtShort, todayISO } from '../domain/dates'
import { useApp } from '../state/store'
import { groceryPlan } from '../state/selectors'
import { Num } from '../components/Num'
import { IconCheck } from '../components/icons'

// §6.3: one weekly shop — three sections, persists until the next generation,
// re-computes on swap keeping checked items checked. Checked items recede.

function CheckRow({ item, checked, onToggle }: { item: GroceryItem; checked: boolean; onToggle: () => void }) {
  // qty like "1280 g" or "7 × 450 g" → tabular number + muted unit
  const qty = item.qty?.match(/^([\d\s×]+)\s(g)$/)
  return (
    <button className="check-row" onClick={onToggle} aria-pressed={checked}>
      <span className="check-box" aria-hidden>
        {checked && <IconCheck size={15} />}
      </span>
      <span className="check-label" style={{ flex: 1 }}>
        {item.label}
        {item.sub && <span className="tiny faint"> · {item.sub}</span>}
      </span>
      {item.qty && (
        <span className="check-qty small" style={{ flexShrink: 0 }}>
          {qty ? <Num v={qty[1]!.trim()} u={qty[2]} /> : <Num v={item.qty} />}
        </span>
      )}
    </button>
  )
}

export function Grocery() {
  const { state, dispatch } = useApp()
  const today = todayISO()
  const plan = groceryPlan(state, today)

  const list: GroceryList | null = useMemo(
    () => (plan ? buildGroceryList(plan, state.recipes, state.ingredients) : null),
    [plan, state.recipes, state.ingredients],
  )

  if (!plan || !list) {
    return (
      <>
        <h1 className="screen-title">Grocery</h1>
        <p className="screen-sub">No plan yet — generate a week on the Week tab and the list appears here.</p>
      </>
    )
  }

  const checked = new Set(plan.groceryChecked ?? [])
  const all = [...list.fresh, ...list.freeze, ...list.pantry]
  const done = all.filter((i) => checked.has(i.key)).length

  const sections: { title: string; sub: string; items: GroceryItem[] }[] = [
    { title: 'Fresh', sub: 'use ≤ 2 days — S4 + S1 proteins, veg, fruit, dairy', items: list.fresh },
    { title: 'Freeze on arrival', sub: 'S2 + S3 proteins — defrost prompts appear on Today', items: list.freeze },
    { title: 'Pantry check', sub: 'checklist, no quantities', items: list.pantry },
  ]

  return (
    <>
      <h1 className="screen-title">Grocery</h1>
      <p className="screen-sub">
        Shop {fmtShort(plan.weekStartISO)} · cycle {fmtDayMonth(plan.weekStartISO)} → {fmtDayMonth(addDays(plan.weekStartISO, 6))} ·{' '}
        <Num v={`${done}/${all.length}`} /> ticked
      </p>

      {sections.map((section) => {
        const sectionDone = section.items.filter((i) => checked.has(i.key)).length
        return (
          <div className="card" key={section.title}>
            <div className="row-between">
              <div className="card-title">{section.title}</div>
              <span className="small dim">
                <Num v={`${sectionDone}/${section.items.length}`} />
              </span>
            </div>
            <div className="tiny faint" style={{ marginBottom: 4 }}>
              {section.sub}
            </div>
            {section.items.length === 0 && <p className="dim small">Nothing needed.</p>}
            {section.items.map((item) => (
              <CheckRow
                key={item.key}
                item={item}
                checked={checked.has(item.key)}
                onToggle={() => dispatch({ type: 'toggleGrocery', weekStartISO: plan.weekStartISO, key: item.key })}
              />
            ))}
          </div>
        )
      })}

      <p className="tiny faint center">Swapping a session re-computes this list — ticked items stay ticked.</p>
    </>
  )
}
