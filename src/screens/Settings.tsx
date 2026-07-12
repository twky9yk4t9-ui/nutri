import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState } from '../domain/types'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { exportFilename, parseImport, serializeState } from '../state/persist'
import { Sheet, ConfirmDialog } from '../components/Sheet'
import { Num } from '../components/Num'
import { IconBox, IconChevronLeft, IconChevronRight, IconToday, IconWeek } from '../components/icons'

// iOS-style grouped rows with summaries; each opens a focused edit sheet.
// Opened from the header gear (no tab). Hard rule (§1): only the owner
// changes targets, here, behind an explicit confirmation.

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <label className="small dim" style={{ display: 'grid', gap: 4 }}>
      {label}
      <input inputMode="numeric" value={String(value)} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', minHeight: 44 }} />
    </label>
  )
}

function TargetsSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [targets, setTargets] = useState(state.settings.targets)
  const [confirm, setConfirm] = useState(false)
  const setNum = (key: keyof typeof targets) => (v: string) => {
    const n = Number(v)
    if (v === '' || Number.isFinite(n)) setTargets((t) => ({ ...t, [key]: v === '' ? 0 : n }))
  }
  const dirty = JSON.stringify(targets) !== JSON.stringify(state.settings.targets)

  return (
    <Sheet title="Daily targets" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="kcal" value={targets.kcal} onChange={setNum('kcal')} />
        <Field label="Protein (g)" value={targets.p} onChange={setNum('p')} />
        <Field label="Fat min (g)" value={targets.fMin} onChange={setNum('fMin')} />
        <Field label="Fat max (g)" value={targets.fMax} onChange={setNum('fMax')} />
        <Field label="Carbs min (g)" value={targets.cMin} onChange={setNum('cMin')} />
        <Field label="Carbs max (g)" value={targets.cMax} onChange={setNum('cMax')} />
      </div>
      <button className="btn btn-accent btn-block mt" disabled={!dirty} onClick={() => setConfirm(true)}>
        Save targets
      </button>
      <p className="footnote">Reference values shown across the app — the app never changes them by itself.</p>
      {confirm && (
        <ConfirmDialog
          title="Change targets?"
          body="This changes your plan reference values everywhere in the app."
          confirmLabel="Change targets"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            dispatch({ type: 'updateSettings', settings: { ...state.settings, targets } })
            setConfirm(false)
            onClose()
          }}
        />
      )}
    </Sheet>
  )
}

function RhythmSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  return (
    <Sheet title="Week rhythm" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label className="small dim" style={{ display: 'grid', gap: 4 }}>
          Shop day
          <select
            value={state.settings.shopDay}
            onChange={(e) => dispatch({ type: 'updateSettings', settings: { ...state.settings, shopDay: e.target.value } })}
          >
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="small dim" style={{ display: 'grid', gap: 4 }}>
          Plan day
          <select
            value={state.settings.planGenDay}
            onChange={(e) => dispatch({ type: 'updateSettings', settings: { ...state.settings, planGenDay: e.target.value } })}
          >
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="footnote">Labels only in v1 — plan generation stays manual.</p>
    </Sheet>
  )
}

function BackupSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [pendingImport, setPendingImport] = useState<AppState | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const doExport = () => {
    const blob = new Blob([serializeState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFilename()
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (file: File | undefined) => {
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      setPendingImport(parseImport(text))
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read the file.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Sheet title="Backup" onClose={onClose}>
      <div className="row">
        <button className="btn btn-block" onClick={doExport}>
          Export JSON
        </button>
        <button className="btn btn-block" onClick={() => fileRef.current?.click()}>
          Import JSON
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => onImportFile(e.target.files?.[0])} />
      </div>
      {importError && (
        <p className="small mt" style={{ color: 'var(--red)' }}>
          {importError}
        </p>
      )}
      <p className="footnote">Everything lives in this device's browser storage — export before switching phone or laptop.</p>
      {pendingImport && (
        <ConfirmDialog
          title="Import backup?"
          body={`Replaces everything on this device with the backup (${pendingImport.weeks.length} week plans, ${pendingImport.weights.length} weight entries).`}
          confirmLabel="Replace data"
          danger
          onCancel={() => setPendingImport(null)}
          onConfirm={() => {
            dispatch({ type: 'importState', state: pendingImport })
            setPendingImport(null)
            onClose()
          }}
        />
      )}
    </Sheet>
  )
}

export function Settings() {
  const { state } = useApp()
  const { closeSettings } = useNav()
  const [sheet, setSheet] = useState<'targets' | 'rhythm' | 'backup' | null>(null)
  const t = state.settings.targets

  const rows: { id: 'targets' | 'rhythm' | 'backup'; icon: ReactNode; title: string; summary: ReactNode }[] = [
    {
      id: 'targets',
      icon: <IconToday size={17} />,
      title: 'Daily targets',
      summary: (
        <>
          <Num v={t.kcal} u="kcal" /> · <Num v={t.p} u="P" />
        </>
      ),
    },
    {
      id: 'rhythm',
      icon: <IconWeek size={17} />,
      title: 'Week rhythm',
      summary: `Shop ${state.settings.shopDay} · Plan ${state.settings.planGenDay}`,
    },
    {
      id: 'backup',
      icon: <IconBox size={17} />,
      title: 'Backup',
      summary: `${state.weeks.length} plans · ${state.weights.length} weights`,
    },
  ]

  return (
    <>
      <div className="screen-head">
        <div className="row" style={{ gap: 2 }}>
          <button className="icon-btn" style={{ margin: '-8px 0 0 -14px' }} onClick={closeSettings} aria-label="Back">
            <IconChevronLeft size={21} />
          </button>
          <h1 className="screen-title">Settings</h1>
        </div>
      </div>

      <div className="card" style={{ padding: '2px 14px', marginTop: 12 }}>
        {rows.map((row) => (
          <button key={row.id} className="disclosure-row" onClick={() => setSheet(row.id)}>
            <span className="row-icon">{row.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{row.title}</div>
              <div className="small dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.summary}
              </div>
            </span>
            <span className="faint" style={{ display: 'inline-flex' }}>
              <IconChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>

      <p className="footnote center">NUTRI v1 · offline · metric only · weeks start Monday · ingredient labels live in the seed data (§10)</p>

      {sheet === 'targets' && <TargetsSheet onClose={() => setSheet(null)} />}
      {sheet === 'rhythm' && <RhythmSheet onClose={() => setSheet(null)} />}
      {sheet === 'backup' && <BackupSheet onClose={() => setSheet(null)} />}
    </>
  )
}
