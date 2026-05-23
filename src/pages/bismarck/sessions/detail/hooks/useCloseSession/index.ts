import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCloseSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('preorder_sessions')
        .update({ status: 'closed' })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preorder_sessions'] })
      qc.invalidateQueries({ queryKey: ['session-detail'] })
    },
  })
}
