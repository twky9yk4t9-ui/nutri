import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { AppState, SessionId, Settings, SlotKey, SlotStatus, SupplementKey, WeekPlan, WeightEntry } from '../domain/types'
import { ingredientMap } from '../domain/macros'
import { swapSession } from '../domain/rotation'
import { buildGroceryList, reconcileChecked } from '../domain/grocery'
import { deleteWeight, upsertWeight } from '../domain/weights'
import { debouncedSave, flushSave, loadState } from './persist'

export type Action =
  | { type: 'storePlan'; plan: WeekPlan }
  | { type: 'cycleSlotStatus'; date: string; slot: SlotKey }
  | { type: 'setSlotStatus'; date: string; slot: SlotKey; status: SlotStatus }
  | { type: 'swapSession'; weekStartISO: string; sessionId: SessionId; recipeId: string }
  | { type: 'toggleSessionDone'; weekStartISO: string; sessionId: SessionId }
  | { type: 'toggleGrocery'; weekStartISO: string; key: string }
  | { type: 'toggleSupplement'; date: string; key: SupplementKey }
  | { type: 'upsertWeight'; entry: WeightEntry }
  | { type: 'deleteWeight'; dateISO: string }
  | { type: 'updateSettings'; settings: Settings }
  | { type: 'dismissFreezerTip' }
  | { type: 'importState'; state: AppState }

const NEXT_STATUS: Record<SlotStatus, SlotStatus> = {
  planned: 'eaten',
  eaten: 'off-plan',
  'off-plan': 'planned',
}

function updatePlan(state: AppState, weekStartISO: string, fn: (plan: WeekPlan) => WeekPlan): AppState {
  return {
    ...state,
    weeks: state.weeks.map((w) => (w.weekStartISO === weekStartISO ? fn(w) : w)),
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'storePlan': {
      const others = state.weeks.filter((w) => w.weekStartISO !== action.plan.weekStartISO)
      const weeks = [...others, action.plan].sort((a, b) => a.weekStartISO.localeCompare(b.weekStartISO))
      return { ...state, weeks }
    }
    case 'cycleSlotStatus': {
      return {
        ...state,
        weeks: state.weeks.map((w) => ({
          ...w,
          slots: w.slots.map((s) =>
            s.date === action.date && s.slot === action.slot ? { ...s, status: NEXT_STATUS[s.status] } : s,
          ),
        })),
      }
    }
    case 'setSlotStatus': {
      return {
        ...state,
        weeks: state.weeks.map((w) => ({
          ...w,
          slots: w.slots.map((s) =>
            s.date === action.date && s.slot === action.slot ? { ...s, status: action.status } : s,
          ),
        })),
      }
    }
    case 'swapSession': {
      return updatePlan(state, action.weekStartISO, (plan) => {
        const swapped = swapSession(plan, state.recipes, ingredientMap(state.ingredients), action.sessionId, action.recipeId)
        const list = buildGroceryList(swapped, state.recipes, state.ingredients)
        return { ...swapped, groceryChecked: reconcileChecked(plan.groceryChecked, list) }
      })
    }
    case 'toggleSessionDone': {
      return updatePlan(state, action.weekStartISO, (plan) => ({
        ...plan,
        sessions: plan.sessions.map((s) => (s.id === action.sessionId ? { ...s, done: !s.done } : s)),
      }))
    }
    case 'toggleGrocery': {
      return updatePlan(state, action.weekStartISO, (plan) => {
        const checked = new Set(plan.groceryChecked ?? [])
        if (checked.has(action.key)) checked.delete(action.key)
        else checked.add(action.key)
        return { ...plan, groceryChecked: [...checked] }
      })
    }
    case 'toggleSupplement': {
      // A date with no entry is a fresh day: everything unchecked by default.
      const day = state.supplementsLog[action.date] ?? { creatine: false, omega3: false, vitaminD3: false }
      return {
        ...state,
        supplementsLog: { ...state.supplementsLog, [action.date]: { ...day, [action.key]: !day[action.key] } },
      }
    }
    case 'upsertWeight':
      return { ...state, weights: upsertWeight(state.weights, action.entry) }
    case 'deleteWeight':
      return { ...state, weights: deleteWeight(state.weights, action.dateISO) }
    case 'updateSettings':
      return { ...state, settings: action.settings }
    case 'dismissFreezerTip':
      return { ...state, flags: { ...state.flags, freezerTipDismissed: true } }
    case 'importState':
      return action.state
  }
}

interface Store {
  state: AppState
  dispatch: (action: Action) => void
}

const StoreContext = createContext<Store | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    debouncedSave(state)
  }, [state])

  useEffect(() => {
    const flush = () => flushSave()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useApp(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useApp must be used inside <AppProvider>')
  return store
}
