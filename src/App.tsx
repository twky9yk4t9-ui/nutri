import { createContext, useContext, useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { Today } from './screens/Today'
import { Week } from './screens/Week'
import { Recipes } from './screens/Recipes'
import { RecipeDetail } from './screens/RecipeDetail'
import { Grocery } from './screens/Grocery'
import { Trends } from './screens/Trends'
import { Settings } from './screens/Settings'

interface RecipeViewState {
  recipeId: string
  servings: number
}

interface Nav {
  tab: Tab
  setTab: (tab: Tab) => void
  /** Open a recipe detail, optionally preset to a session's portion count (§9.3). */
  openRecipe: (recipeId: string, servings?: number) => void
  closeRecipe: () => void
}

const NavContext = createContext<Nav | null>(null)

export function useNav(): Nav {
  const nav = useContext(NavContext)
  if (!nav) throw new Error('useNav must be used inside <App>')
  return nav
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [recipeView, setRecipeView] = useState<RecipeViewState | null>(null)

  const nav: Nav = {
    tab,
    setTab: (t) => {
      setRecipeView(null)
      setTab(t)
    },
    openRecipe: (recipeId, servings = 1) => setRecipeView({ recipeId, servings }),
    closeRecipe: () => setRecipeView(null),
  }

  return (
    <NavContext.Provider value={nav}>
      <div className="app">
        {recipeView ? (
          <RecipeDetail recipeId={recipeView.recipeId} initialServings={recipeView.servings} />
        ) : (
          <>
            {tab === 'today' && <Today />}
            {tab === 'week' && <Week />}
            {tab === 'recipes' && <Recipes />}
            {tab === 'grocery' && <Grocery />}
            {tab === 'trends' && <Trends />}
            {tab === 'settings' && <Settings />}
          </>
        )}
      </div>
      <TabBar active={tab} onSelect={nav.setTab} />
    </NavContext.Provider>
  )
}
