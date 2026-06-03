import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'
import type { SessionItem } from '@/types/menu'

export interface SessionData {
  session: Session
  sessionItems: SessionItem[]
  orderCount: number
}

async function fetchSession(slug: string): Promise<SessionData> {
  const sessionResult = await supabase
    .from('preorder_sessions')
    .select('*')
    .eq('slug', slug)
    .single()
  if (sessionResult.error) throw sessionResult.error
  const session = sessionResult.data as Session

  const [itemsResult, countResult] = await Promise.all([
    supabase
      .from('preorder_session_items')
      .select('*, menu_items(*)')
      .eq('preorder_session', session.id)
      .eq('is_available', true),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('preorder_session', session.id),
  ])
  if (itemsResult.error) throw itemsResult.error
  if (countResult.error) throw countResult.error

  const sessionItems = (itemsResult.data ?? []).sort((a, b) =>
    (a.menu_items?.name ?? '').localeCompare(b.menu_items?.name ?? ''),
  ) as SessionItem[]

  return {
    session,
    sessionItems,
    orderCount: countResult.count ?? 0,
  }
}

export function useSession(slug: string | undefined) {
  return useQuery({
    queryKey: ['session', slug],
    queryFn: () => fetchSession(slug!),
    retry: false,
    enabled: !!slug,
  })
}
