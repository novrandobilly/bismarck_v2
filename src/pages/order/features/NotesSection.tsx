import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'

interface Props { form: UseFormReturn<OrderFormValues> }

export function NotesSection({ form }: Props) {
  return (
    <div className="mb-6">
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-3">
        Notes
      </p>
      <div className="bg-surface-white rounded-xl border border-kraft-border px-4 py-4">
        <textarea
          {...form.register('notes')}
          rows={3}
          placeholder="Any special requests? (optional)"
          className="w-full border border-kraft-border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:ring-2 focus:ring-crust-gold/40 transition-shadow resize-none bg-transparent"
        />
      </div>
    </div>
  )
}
