import type { ReactNode } from 'react'
import { useNav } from '../App'
import { IconSettings } from './icons'

/**
 * iOS-style large-title header. Settings lives behind the gear on every
 * screen (standard pattern); `sub` is for compact content (dates, figures),
 * never explainer prose — that belongs in a .footnote.
 */
export function ScreenHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  const { openSettings } = useNav()
  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">{title}</h1>
        {right ?? (
          <button className="icon-btn" onClick={openSettings} aria-label="Settings">
            <IconSettings size={21} />
          </button>
        )}
      </div>
      {sub && <p className="screen-sub">{sub}</p>}
    </>
  )
}
