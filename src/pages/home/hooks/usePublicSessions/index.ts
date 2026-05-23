import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'

export function usePublicSessions() {
  return useQuery({
    queryKey: ['public-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preorder_sessions')
        .select('*')
        .order('fulfillment_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as Session[]
    },
    retry: false,
  })
}

export function getOpenSession(sessions: Session[]): Session | undefined {
  return sessions.find(
    s => s.status === 'open' && new Date() <= new Date(s.order_deadline),
  )
}

export function getClosedSessions(sessions: Session[]): Session[] {
  return sessions.filter(
    s => s.status === 'closed' || new Date() > new Date(s.order_deadline),
  )
}
