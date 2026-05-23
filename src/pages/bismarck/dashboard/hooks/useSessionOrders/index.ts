import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

export function useSessionOrders(sessionId: string) {
  return useQuery({
    queryKey: ['session-orders-preview', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, fulfillment_type, is_fulfilled, created_at')
        .eq('preorder_session', sessionId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Pick<Order, 'id' | 'customer_name' | 'fulfillment_type' | 'is_fulfilled' | 'created_at'>[]
    },
    enabled: !!sessionId,
  })
}
