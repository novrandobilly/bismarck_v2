import { useConfirmationModalContext } from '../ConfirmationModalContext'

export function NotesSummary() {
  const { values } = useConfirmationModalContext()
  
  if (!values.notes) return null
  
  return (
    <div className="mb-4">
      <p className="font-sans text-[10px] font-semibold text-ink-medium uppercase tracking-[0.1em] mb-1.5">
        Notes
      </p>
      <div className="bg-flour-dust/40 rounded-xl p-3 border border-kraft-border-soft text-xs text-ink-dark break-words whitespace-pre-line leading-relaxed">
        {values.notes}
      </div>
    </div>
  )
}
