import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'
import type { Order } from '@/types/order'

export interface SessionDetailData {
  session: Session
  orders: Order[]
}

async function fetchSessionDetail(id: string): Promise<SessionDetailData> {
  const [sessionResult, ordersResult] = await Promise.all([
    supabase.from('preorder_sessions').select('*').eq('id', id).single(),
    supabase
      .from('orders')
      .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
      .eq('preorder_session', id)
      .order('created_at', { ascending: true }),
  ])
  if (sessionResult.error) throw sessionResult.error
  if (ordersResult.error) throw ordersResult.error
  return {
    session: sessionResult.data as Session,
    orders: (ordersResult.data ?? []) as Order[],
  }
}

export function useSessionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['session-detail', id],
    queryFn: () => fetchSessionDetail(id!),
    enabled: !!id,
  })
}
