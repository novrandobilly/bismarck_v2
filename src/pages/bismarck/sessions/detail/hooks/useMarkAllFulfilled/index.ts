import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

export function useMarkAllFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orders, is_fulfilled }: { orders: Order[]; is_fulfilled: boolean }) => {
      const ids = orders.map(o => o.id)
      const { error } = await supabase
        .from('orders')
        .update({ is_fulfilled })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      if (sessionId) qc.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
