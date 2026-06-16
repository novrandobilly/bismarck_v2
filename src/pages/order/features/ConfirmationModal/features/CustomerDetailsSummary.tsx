import { useConfirmationModalContext } from '../ConfirmationModalContext'

export function CustomerDetailsSummary() {
  const { values } = useConfirmationModalContext()
  
  return (
    <div className="mb-4">
      <p className="font-sans text-[10px] font-semibold text-ink-medium uppercase tracking-[0.1em] mb-1.5">
        Customer Details
      </p>
      <div className="bg-flour-dust/40 rounded-xl p-3 border border-kraft-border-soft space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-sans text-ink-medium">Name</span>
          <span className="font-sans font-medium text-ink-dark">{values.customer_name}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-sans text-ink-medium">WhatsApp</span>
          <span className="font-sans font-medium text-ink-dark">{values.whatsapp}</span>
        </div>
      </div>
    </div>
  )
}
