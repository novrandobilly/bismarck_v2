import { useConfirmationModalContext } from '../ConfirmationModalContext'
import { formatRupiah } from '@/tools/formatRupiah'

export function OrderSummary() {
  const { selectedItems, sessionItems, totalAmount } = useConfirmationModalContext()
  
  return (
    <div className="mb-4">
      <p className="font-sans text-[10px] font-semibold text-ink-medium uppercase tracking-[0.1em] mb-1.5">
        Order Summary
      </p>
      <div className="bg-flour-dust/40 rounded-xl p-3 border border-kraft-border-soft space-y-2">
        {selectedItems.map((item) => {
          const sessionItem = sessionItems.find((si) => si.id === item.session_item_id)
          const name = sessionItem?.menu_items?.name ?? 'Bagel Item'
          const price = sessionItem?.price ?? 0
          const subtotal = price * item.quantity
          return (
            <div key={item.session_item_id} className="flex justify-between items-start text-xs gap-3">
              <span className="font-sans text-ink-dark leading-snug">
                {name} <span className="text-ink-medium font-medium">×{item.quantity}</span>
              </span>
              <span className="font-sans font-medium text-ink-dark shrink-0">
                {formatRupiah(subtotal)}
              </span>
            </div>
          )
        })}
        <div className="border-t border-kraft-border-soft pt-2.5 flex justify-between items-center">
          <span className="font-sans font-semibold text-ink-dark text-sm">
            Total Amount
          </span>
          <span className="font-sans font-bold text-crust-gold text-base">
            {formatRupiah(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}
