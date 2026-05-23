import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { OrderFormValues } from '@/types/order'

interface SubmitOrderInput {
  sessionId: string
  values: OrderFormValues
}

async function submitOrder({ sessionId, values }: SubmitOrderInput): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      preorder_session: sessionId,
      customer_name: values.customer_name,
      whatsapp: values.whatsapp.replace(/\D/g, ''),
      fulfillment_type: values.fulfillment_type,
      delivery_address: values.delivery_address ?? '',
      custom_location: values.custom_location ?? '',
      notes: values.notes ?? '',
    })
    .select('id')
    .single()
  if (orderError) throw orderError

  const itemRows = values.items
    .filter(i => i.quantity > 0)
    .map(item => ({
      order_id: order.id,
      preorder_session_item: item.session_item_id,
      quantity: item.quantity,
    }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
  if (itemsError) throw itemsError

  return order.id
}

export function useSubmitOrder() {
  return useMutation({ mutationFn: submitOrder })
}
