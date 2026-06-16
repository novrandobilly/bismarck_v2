import { createContext, useContext } from 'react'
import type { OrderFormValues, OrderItemFormValue } from '@/types/order'
import type { SessionItem } from '@/types/menu'

export interface ConfirmationModalContextValue {
  values: OrderFormValues
  sessionId: string
  sessionItems: SessionItem[]
  selectedItems: OrderItemFormValue[]
  totalAmount: number
  isPending: boolean
  error: Error | null
  handleConfirm: () => void
  onCancel: () => void
}

export const ConfirmationModalContext = createContext<ConfirmationModalContextValue | null>(null)

export function useConfirmationModalContext() {
  const context = useContext(ConfirmationModalContext)
  if (!context) {
    throw new Error('useConfirmationModalContext must be used within ConfirmationModalProvider')
  }
  return context
}
