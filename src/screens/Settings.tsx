import { useRef, useState } from 'react'
import type { AppState } from '../domain/types'
import { useApp } from '../state/store'
import { exportFilename, parseImport, serializeState } from '../state/persist'
import { ConfirmDialog } from '../components/Sheet'

// §9.6 Settings — targets (confirmation-gated), shop/plan days, export/import.
// Hard rule (§1): the app itself NEVER changes targets; only the owner does,
// here, behind an explicit confirmation.

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <label className="small dim" style={{ display: 'grid', gap: 4 }}>
      {label}
      <input
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', minHeight: 44 }}
      />
    </label>
  )
}

export function Settings() {
  const { state, dispatch } = useApp()
  const [targets, setTargets] = useState(state.settings.targets)
  const [confirmTargets, setConfirmTargets] = useState(false)
  const [pendingImport, setPendingImport] = useState<AppState | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const setNum = (key: keyof typeof targets) => (v: string) => {
    const n = Number(v)
    if (v === '' || Number.isFinite(n)) setTargets((t) => ({ ...t, [key]: v === '' ? 0 : n }))
  }

  const dirty = JSON.stringify(targets) !== JSON.stringify(state.settings.targets)

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
    <>
      <h1 className="screen-title">Settings</h1>
      <p className="screen-sub">Metric only · English · weeks start Monday.</p>

      <div className="card">
        <div className="card-title">Daily targets</div>
        <p className="tiny dim" style={{ margin: '2px 0 10px' }}>
          Reference values shown across the app. The app never changes them by itself.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="kcal" value={targets.kcal} onChange={setNum('kcal')} />
          <Field label="Protein (g)" value={targets.p} onChange={setNum('p')} />
          <Field label="Fat min (g)" value={targets.fMin} onChange={setNum('fMin')} />
          <Field label="Fat max (g)" value={targets.fMax} onChange={setNum('fMax')} />
          <Field label="Carbs min (g)" value={targets.cMin} onChange={setNum('cMin')} />
          <Field label="Carbs max (g)" value={targets.cMax} onChange={setNum('cMax')} />
        </div>
        <button className="btn btn-block mt" disabled={!dirty} onClick={() => setConfirmTargets(true)}>
          Save targets…
        </button>
      </div>

      <div className="card">
        <div className="card-title">Week rhythm</div>
        <p className="tiny dim" style={{ margin: '2px 0 10px' }}>
          v1 uses these as labels — plan generation stays manual.
        </p>
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
            Plan generation day
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
      </div>

      <div className="card">
        <div className="card-title">Backup</div>
        <p className="tiny dim" style={{ margin: '2px 0 10px' }}>
          Everything lives in this device's browser storage — export before switching phone/laptop.
        </p>
        <div className="row">
          <button className="btn btn-block" onClick={doExport}>
            Export JSON
          </button>
          <button className="btn btn-block" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => onImportFile(e.target.files?.[0])}
          />
        </div>
        {importError && (
          <p className="small mt" style={{ color: 'var(--red)' }}>
            {importError}
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-title">About</div>
        <p className="small dim" style={{ margin: '4px 0 0' }}>
          NUTRI v1.0 — personal meal operating system. Offline PWA, no accounts, no network calls.
        </p>
        <div className="dataline small" style={{ minHeight: 32, marginTop: 4 }}>
          <span className="dim">Week plans stored</span>
          <span className="num">{state.weeks.length}</span>
        </div>
        <div className="dataline small" style={{ minHeight: 32 }}>
          <span className="dim">Weight entries</span>
          <span className="num">{state.weights.length}</span>
        </div>
        <p className="tiny faint" style={{ margin: '8px 0 0' }}>
          Owner task (§10): re-verify ingredient labels after arriving in Dublin; values live in the seed data.
        </p>
      </div>

      {confirmTargets && (
        <ConfirmDialog
          title="Change targets?"
          body="This changes your plan reference values everywhere in the app."
          confirmLabel="Change targets"
          onCancel={() => setConfirmTargets(false)}
          onConfirm={() => {
            dispatch({ type: 'updateSettings', settings: { ...state.settings, targets } })
            setConfirmTargets(false)
          }}
        />
      )}

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
          }}
        />
      )}
    </>
  )
}
