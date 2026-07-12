// Numbers are the heroes (PRODUCT.md §1): tabular figures with smaller,
// muted unit labels — "160 g", "787 kcal", "48 P".

export function Num({ v, u, lg = false, c }: { v: number | string; u?: string; lg?: boolean; c?: string }) {
  return (
    <span className={lg ? 'num num-lg' : 'num'} style={c ? { color: c } : undefined}>
      {v}
      {u && <span className="unit">{u}</span>}
    </span>
  )
}

/** kcal · protein pair, the app's most repeated figure. Color-coded app-wide:
 *  energy is always orange, protein always cyan — readable without labels. */
export function MacroPair({ kcal, p, lg = false }: { kcal: number; p: number; lg?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 10, alignItems: 'baseline' }}>
      <Num v={kcal} u="kcal" lg={lg} c="var(--orange)" />
      <Num v={p} u="P" lg={lg} c="var(--cyan)" />
    </span>
  )
}
