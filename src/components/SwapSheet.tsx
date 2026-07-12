import type { SessionId, WeekPlan } from '../domain/types'
import { SALMON_RECIPE_ID } from '../domain/seed'
import { useApp } from '../state/store'
import { Sheet } from './Sheet'

// §6.2 rule 6: swap replaces the whole session (all its portions); the grocery
// list re-computes and already-checked items stay checked (handled in store).

export function SwapSheet({ plan, sessionId, onClose }: { plan: WeekPlan; sessionId: SessionId; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const session = plan.sessions.find((s) => s.id === sessionId)!
  const usedElsewhere = new Set(plan.sessions.filter((s) => s.id !== sessionId).map((s) => s.recipeId))
  const options = state.recipes.filter(
    (r) => r.slotType === 'main' && (sessionId === 'S2' ? r.tags.includes('quick') : true),
  )

  const pick = (recipeId: string) => {
    dispatch({ type: 'swapSession', weekStartISO: plan.weekStartISO, sessionId, recipeId })
    onClose()
  }

  return (
    <Sheet title={`Swap ${sessionId} — whole session (${session.portions} portions)`} onClose={onClose}>
      <p className="tiny dim" style={{ marginTop: 0 }}>
        {sessionId === 'S2' && 'Tuesday is post-gym: quick recipes only. '}
        Grocery list re-computes; items you already ticked stay ticked.
      </p>
      <div className="grid-gap">
        {options.map((r) => {
          const current = r.id === session.recipeId
          const disabled = usedElsewhere.has(r.id)
          return (
            <button
              key={r.id}
              className="card mb0"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                opacity: disabled ? 0.45 : 1,
                borderColor: current ? 'var(--accent-dim)' : undefined,
              }}
              disabled={disabled || current}
              onClick={() => pick(r.id)}
            >
              <div className="row-between">
                <div>
                  <div className="card-title">{r.name}</div>
                  <div className="tiny dim">
                    {r.verified.kcal} kcal · P {r.verified.p}
                    {r.tags.length > 0 && <> · {r.tags.join(' · ')}</>}
                    {current && ' · current'}
                    {disabled && ' · already this week'}
                    {r.id === SALMON_RECIPE_ID && !disabled && !current && ' · snacks on its days switch to low-fat (B′/D′/F/G)'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
