import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

async function fetchOrderBill(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data as Order
}

export function useOrderBill(orderId: string | null) {
  return useQuery({
    queryKey: ['order-bill', orderId],
    queryFn: () => fetchOrderBill(orderId!),
    enabled: !!orderId,
  })
}
