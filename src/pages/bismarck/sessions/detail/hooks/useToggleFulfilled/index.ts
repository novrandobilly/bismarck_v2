import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useToggleFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, is_fulfilled }: { orderId: string; is_fulfilled: boolean }) => {
      const { error } = await supabase
        .from('orders')
        .update({ is_fulfilled })
        .eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => {
      if (sessionId) qc.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
