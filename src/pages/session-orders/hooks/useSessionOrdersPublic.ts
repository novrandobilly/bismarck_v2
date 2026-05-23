import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'
import type { Session } from '@/types/session'

interface SessionOrdersData {
  session: Session
  orders: Order[]
}

async function fetchSessionOrders(sessionId: string): Promise<SessionOrdersData> {
  const [sessionResult, ordersResult] = await Promise.all([
    supabase.from('preorder_sessions').select('*').eq('id', sessionId).single(),
    supabase
      .from('orders')
      .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
      .eq('preorder_session', sessionId)
      .eq('has_paid', true)
      .order('created_at', { ascending: true }),
  ])
  if (sessionResult.error) throw sessionResult.error
  if (ordersResult.error) throw ordersResult.error
  return {
    session: sessionResult.data as Session,
    orders: (ordersResult.data ?? []) as Order[],
  }
}

export function useSessionOrdersPublic(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-orders-public', sessionId],
    queryFn: () => fetchSessionOrders(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30_000,
  })
}
