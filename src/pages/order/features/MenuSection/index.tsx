import type { SessionItem } from '@/types/menu'
import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { MenuItemCard } from './features/MenuItemCard'

interface Props {
  sessionItems: SessionItem[]
  form: UseFormReturn<OrderFormValues>
}

export function MenuSection({ sessionItems, form }: Props) {
  const items = form.watch('items')
  const itemsError = form.formState.errors.items

  function getQuantity(sessionItemId: string): number {
    return items.find(i => i.session_item_id === sessionItemId)?.quantity ?? 0
  }

  function handleChange(sessionItemId: string, qty: number) {
    form.setValue('items', items.map(i =>
      i.session_item_id === sessionItemId ? { ...i, quantity: qty } : i,
    ), { shouldValidate: false })
  }

  return (
    <div className="mb-6">
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-3">
        Menu
      </p>
      {itemsError && typeof itemsError === 'object' && 'message' in itemsError &&
        (itemsError as { message?: string }).message && (
        <p className="font-sans text-red-600 text-xs mb-2">
          {(itemsError as { message?: string }).message}
        </p>
      )}
      <div className="bg-surface-white rounded-xl border border-kraft-border divide-y divide-kraft-border-soft">
        {sessionItems.map(si => (
          <MenuItemCard
            key={si.id}
            sessionItem={si}
            quantity={getQuantity(si.id)}
            onChangeQuantity={(qty) => handleChange(si.id, qty)}
          />
        ))}
      </div>
    </div>
  )
}
