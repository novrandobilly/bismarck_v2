import { useSubmitOrder } from '../../../hooks/useSubmitOrder'
import type { OrderFormValues } from '@/types/order'
import type { SessionItem } from '@/types/menu'

interface UseConfirmationProps {
  values: OrderFormValues
  sessionId: string
  sessionItems: SessionItem[]
  onSuccess: (orderId: string) => void
}

export function useConfirmation({
  values,
  sessionId,
  sessionItems,
  onSuccess,
}: UseConfirmationProps) {
  const { mutate: submitOrder, isPending, error } = useSubmitOrder()

  const selectedItems = values.items.filter((item) => item.quantity > 0)
  
  const totalAmount = selectedItems.reduce((sum, item) => {
    const sessionItem = sessionItems.find((si) => si.id === item.session_item_id)
    const price = sessionItem?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  function handleConfirm() {
    submitOrder(
      { sessionId, values },
      {
        onSuccess: (orderId: string) => {
          onSuccess(orderId)
        },
      }
    )
  }

  return {
    values,
    sessionId,
    sessionItems,
    selectedItems,
    totalAmount,
    isPending,
    error,
    handleConfirm,
  }
}
