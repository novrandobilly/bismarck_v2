import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'
import type { Session } from '@/types/session'

interface SessionOrdersData {
  session: Session
  orders: Order[]
}

async function fetchSessionOrders(slug: string): Promise<SessionOrdersData> {
  const sessionResult = await supabase
    .from('preorder_sessions')
    .select('*')
    .eq('slug', slug)
    .single()
  if (sessionResult.error) throw sessionResult.error
  const session = sessionResult.data as Session

  const ordersResult = await supabase
    .from('orders')
    .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
    .eq('preorder_session', session.id)
    .eq('has_paid', true)
    .order('created_at', { ascending: true })
  if (ordersResult.error) throw ordersResult.error

  return {
    session,
    orders: (ordersResult.data ?? []) as Order[],
  }
}

export function useSessionOrdersPublic(slug: string | undefined) {
  return useQuery({
    queryKey: ['session-orders-public', slug],
    queryFn: () => fetchSessionOrders(slug!),
    enabled: !!slug,
    refetchInterval: 30_000,
  })
}
