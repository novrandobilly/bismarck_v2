import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

async function fetchOrderSuccess(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data as Order
}

export function useOrderSuccess(orderId: string | null) {
  return useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => fetchOrderSuccess(orderId!),
    enabled: !!orderId,
    retry: false,
  })
}
