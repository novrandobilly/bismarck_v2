import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function markOrderPaid(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ has_paid: true })
    .eq('id', orderId)
  if (error) throw error
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markOrderPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] })
    },
  })
}
