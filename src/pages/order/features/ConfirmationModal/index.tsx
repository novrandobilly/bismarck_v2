import type { OrderFormValues } from '@/types/order'
import type { SessionItem } from '@/types/menu'
import { useConfirmation } from './hooks/useConfirmation'
import { ConfirmationModalContext } from './ConfirmationModalContext'
import { CustomerDetailsSummary } from './features/CustomerDetailsSummary'
import { FulfillmentSummary } from './features/FulfillmentSummary'
import { OrderSummary } from './features/OrderSummary'
import { NotesSummary } from './features/NotesSummary'
import { ActionButtons } from './features/ActionButtons'

interface ConfirmationModalProps {
  values: OrderFormValues
  sessionId: string
  sessionItems: SessionItem[]
  onCancel: () => void
  onSuccess: (orderId: string) => void
}

export function ConfirmationModal({
  values,
  sessionId,
  sessionItems,
  onCancel,
  onSuccess,
}: ConfirmationModalProps) {
  const confirmationState = useConfirmation({
    values,
    sessionId,
    sessionItems,
    onSuccess,
  })

  return (
    <ConfirmationModalContext.Provider
      value={{
        ...confirmationState,
        onCancel,
      }}
    >
      <div className="p-6 max-h-[85vh] overflow-y-auto flex flex-col">
        <h2 className="font-serif text-xl font-bold text-ink-dark text-center mb-4">
          Confirm Your Order
        </h2>

        <CustomerDetailsSummary />
        <FulfillmentSummary />
        <OrderSummary />
        <NotesSummary />
        <ActionButtons />
      </div>
    </ConfirmationModalContext.Provider>
  )
}
