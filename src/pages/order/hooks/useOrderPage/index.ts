import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../useSession'
import { useOrderForm } from '../useOrderForm'
import { useModal } from '@/lib/modal/useModal'
import { isSessionClosed } from '../../utils/isSessionClosed'

export function useOrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data, isLoading, error } = useSession(sessionId)
  const form = useOrderForm(data?.sessionItems ?? [], data?.session ?? null)
  const { open: openModal, close: closeModal } = useModal()
  const navigate = useNavigate()

  const isClosed = data ? isSessionClosed(data.session, data.orderCount) : false

  return {
    sessionId,
    data,
    isLoading,
    error,
    form,
    isClosed,
    openModal,
    closeModal,
    navigate,
  }
}
