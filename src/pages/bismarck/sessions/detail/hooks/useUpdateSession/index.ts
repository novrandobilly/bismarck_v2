import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'

export interface UpdateSessionInput {
  title: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: { name: string; time: string }[]
}

export function useUpdateSession(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateSessionInput) => {
      if (!sessionId) throw new Error('Session ID is required')
      const { data, error } = await supabase
        .from('preorder_sessions')
        .update({
          title: values.title,
          description: values.description,
          fulfillment_date: new Date(values.fulfillment_date).toISOString(),
          order_deadline: new Date(values.order_deadline).toISOString(),
          max_orders: values.max_orders,
          allow_pickup: values.allow_pickup,
          allow_delivery: values.allow_delivery,
          custom_locations: values.custom_locations,
        })
        .eq('id', sessionId)
        .select()
        .single()
      if (error) throw error
      return data as Session
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preorder_sessions'] })
      qc.invalidateQueries({ queryKey: ['session-detail', sessionId] })
    },
  })
}
