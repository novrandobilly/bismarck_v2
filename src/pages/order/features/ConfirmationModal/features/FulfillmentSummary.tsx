import { useConfirmationModalContext } from '../ConfirmationModalContext'

export function FulfillmentSummary() {
  const { values } = useConfirmationModalContext()
  
  return (
    <div className="mb-4">
      <p className="font-sans text-[10px] font-semibold text-ink-medium uppercase tracking-[0.1em] mb-1.5">
        Fulfillment
      </p>
      <div className="bg-flour-dust/40 rounded-xl p-3 border border-kraft-border-soft space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-sans text-ink-medium">Type</span>
          <span className="font-sans font-medium text-ink-dark capitalize">
            {values.fulfillment_type === 'pickup' && '🛍 Pickup'}
            {values.fulfillment_type === 'delivery' && '🚚 Delivery'}
            {values.fulfillment_type === 'custom' && '📍 Drop-off'}
          </span>
        </div>
        {values.fulfillment_type === 'delivery' && values.delivery_address && (
          <div className="mt-1 pt-1 border-t border-kraft-border/40 text-xs">
            <span className="block font-sans text-ink-medium mb-0.5">Address:</span>
            <span className="block font-sans text-ink-dark break-words whitespace-pre-line leading-relaxed">
              {values.delivery_address}
            </span>
          </div>
        )}
        {values.fulfillment_type === 'custom' && values.custom_location && (
          <div className="mt-1 pt-1 border-t border-kraft-border/40 text-xs flex justify-between">
            <span className="font-sans text-ink-medium">Location</span>
            <span className="font-sans font-medium text-ink-dark">{values.custom_location}</span>
          </div>
        )}
      </div>
    </div>
  )
}
