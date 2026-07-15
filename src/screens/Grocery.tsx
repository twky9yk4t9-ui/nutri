import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { GroceryItem, GroceryList } from '../domain/grocery'
import { buildGroceryList } from '../domain/grocery'
import { fmtShort, todayISO } from '../domain/dates'
import { useApp } from '../state/store'
import { groceryPlan } from '../state/selectors'
import { ScreenHeader } from '../components/ScreenHeader'
import { Num } from '../components/Num'
import { IconBox, IconCheck, IconGrocery, IconLeaf, IconSnow } from '../components/icons'

// §6.3 as an inset grouped list: the estimate is the hero figure, sections
// carry a category glyph and a muted subtotal, checked items sink.

const eur = (v: number) => `€${v.toFixed(2)}`

function CheckRow({ item, checked, onToggle }: { item: GroceryItem; checked: boolean; onToggle: () => void }) {
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
        <span className="check-qty" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className="small">{qty ? <Num v={qty[1]!.trim()} u={qty[2]} /> : <Num v={item.qty} />}</span>
          {item.costEur !== undefined && item.costEur > 0 && <span className="tiny faint">{eur(item.costEur)}</span>}
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
        <ScreenHeader title="Grocery" />
        <div className="empty">
          <div className="empty-icon">
            <IconGrocery size={44} />
          </div>
          <p>The shopping list appears once a week is planned.</p>
        </div>
      </>
    )
  }

  const checked = new Set(plan.groceryChecked ?? [])
  const all = [...list.fresh, ...list.freeze, ...list.pantry]
  const done = all.filter((i) => checked.has(i.key)).length

  // checked items sink to the bottom of their section (stable within groups)
  const sunk = (items: GroceryItem[]) => [...items.filter((i) => !checked.has(i.key)), ...items.filter((i) => checked.has(i.key))]

  const sections: { title: string; color: string; icon: ReactNode; items: GroceryItem[]; costEur?: number }[] = [
    { title: 'Fresh', color: 'var(--green)', icon: <IconLeaf size={15} />, items: sunk(list.fresh), costEur: list.costEur.fresh },
    { title: 'Freeze on arrival', color: 'var(--blue)', icon: <IconSnow size={15} />, items: sunk(list.freeze), costEur: list.costEur.freeze },
    { title: 'Pantry check', color: 'var(--yellow)', icon: <IconBox size={15} />, items: sunk(list.pantry) },
  ]

  return (
    <>
      <ScreenHeader
        title="Grocery"
        sub={
          <>
            <span className="num num-lg" style={{ fontSize: 22, color: 'var(--cyan)' }}>
              ~€{Math.round(list.costEur.total)}
            </span>
            <span className="tiny faint"> est</span>
            {'  ·  '}shop {fmtShort(plan.weekStartISO)}
            {'  ·  '}
            <Num v={`${done}/${all.length}`} />
          </>
        }
      />

      {sections.map((section) => (
        <div className="card" style={{ padding: '10px 18px 4px' }} key={section.title}>
          <div className="widget-head">
            <span className="icon-chip sm" style={{ '--chip': section.color } as CSSProperties}>
              {section.icon}
            </span>
            <span className="group-label" style={{ flex: 1 }}>
              {section.title}
            </span>
            <span className="tiny" style={{ color: section.color, opacity: 0.8, fontWeight: 600 }}>
              {section.costEur !== undefined && section.costEur > 0 && <>{eur(section.costEur)} · </>}
              {section.items.filter((i) => checked.has(i.key)).length}/{section.items.length}
            </span>
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
      ))}

      <p className="footnote center">Estimate: Dublin average, fresh &amp; freeze only · swaps re-compute, ticks stay</p>
    </>
  )
}
