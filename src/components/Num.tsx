// Numbers are the heroes (PRODUCT.md §1): tabular figures with smaller,
// muted unit labels — "160 g", "787 kcal", "48 P".

export function Num({ v, u, lg = false }: { v: number | string; u?: string; lg?: boolean }) {
  return (
    <span className={lg ? 'num num-lg' : 'num'}>
      {v}
      {u && <span className="unit">{u}</span>}
    </span>
  )
}

/** kcal · protein pair, the app's most repeated figure. */
export function MacroPair({ kcal, p, lg = false }: { kcal: number; p: number; lg?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 10, alignItems: 'baseline' }}>
      <Num v={kcal} u="kcal" lg={lg} />
      <Num v={p} u="P" lg={lg} />
    </span>
  )
}
