import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

async function fetchPendingPayments(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
    .not('payment_proof_url', 'is', null)
    .eq('has_paid', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Order[]
}

export function usePendingPayments() {
  return useQuery({
    queryKey: ['pending-payments'],
    queryFn: fetchPendingPayments,
    refetchInterval: 30_000,
  })
}
