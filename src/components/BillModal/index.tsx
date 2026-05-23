import { useState } from 'react'
import { useVerifyPhone } from './hooks/useVerifyPhone'
import { PhonePrompt } from './features/PhonePrompt'
import { BillDetail } from './features/BillDetail'
import { useModal } from '@/lib/modal/useModal'
import type { Order } from '@/types/order'

interface Props {
  order: Order
}

export function BillModal({ order }: Props) {
  const [verified, setVerified] = useState(false)
  const { close } = useModal()
  const { verify, error } = useVerifyPhone(order.whatsapp)

  function handleVerify(last4: string) {
    if (verify(last4)) setVerified(true)
  }

  if (verified) {
    return <BillDetail order={order} onClose={close} />
  }

  return <PhonePrompt onVerify={handleVerify} onCancel={close} error={error} />
}
