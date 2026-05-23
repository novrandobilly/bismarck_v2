import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'

export function useSessions() {
  return useQuery({
    queryKey: ['preorder_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preorder_sessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Session[]
    },
  })
}

export function hasOpenSession(sessions: Session[]): boolean {
  return sessions.some(
    s => s.status === 'open' && new Date() <= new Date(s.order_deadline),
  )
}
