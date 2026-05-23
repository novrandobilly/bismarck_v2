import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'
import type { SessionItem } from '@/types/menu'

export interface SessionData {
  session: Session
  sessionItems: SessionItem[]
  orderCount: number
}

async function fetchSession(sessionId: string): Promise<SessionData> {
  const [sessionResult, itemsResult, countResult] = await Promise.all([
    supabase.from('preorder_sessions').select('*').eq('id', sessionId).single(),
    supabase
      .from('preorder_session_items')
      .select('*, menu_items(*)')
      .eq('preorder_session', sessionId)
      .eq('is_available', true),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('preorder_session', sessionId),
  ])
  if (sessionResult.error) throw sessionResult.error
  if (itemsResult.error) throw itemsResult.error
  if (countResult.error) throw countResult.error

  const sessionItems = (itemsResult.data ?? []).sort((a, b) =>
    (a.menu_items?.name ?? '').localeCompare(b.menu_items?.name ?? ''),
  ) as SessionItem[]

  return {
    session: sessionResult.data as Session,
    sessionItems,
    orderCount: countResult.count ?? 0,
  }
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId!),
    retry: false,
    enabled: !!sessionId,
  })
}
