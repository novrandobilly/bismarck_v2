import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/session'

export interface SessionFormValues {
  title: string
  slug: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: { name: string; time: string }[]
  selectedItems: { menu_item_id: string; price: number; is_available: boolean }[]
}

async function createSession(values: SessionFormValues): Promise<Session> {
  const { data: session, error: sessionError } = await supabase
    .from('preorder_sessions')
    .insert({
      title: values.title,
      slug: values.slug,
      description: values.description,
      fulfillment_date: new Date(values.fulfillment_date).toISOString(),
      order_deadline: new Date(values.order_deadline).toISOString(),
      max_orders: values.max_orders,
      status: 'open',
      allow_pickup: values.allow_pickup,
      allow_delivery: values.allow_delivery,
      custom_locations: values.custom_locations,
    })
    .select()
    .single()
  if (sessionError) throw sessionError

  const itemRows = values.selectedItems.map(item => ({
    preorder_session: session.id,
    menu_item: item.menu_item_id,
    price: item.price,
    is_available: item.is_available,
  }))

  const { error: itemsError } = await supabase
    .from('preorder_session_items')
    .insert(itemRows)

  if (itemsError) {
    await supabase.from('preorder_sessions').delete().eq('id', session.id)
    throw itemsError
  }

  return session as Session
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preorder_sessions'] }),
  })
}
