import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props { form: UseFormReturn<OrderFormValues> }

export function NotesSection({ form }: Props) {
  const { register, watch, formState: { errors } } = form
  const notes = watch('notes') || ''

  return (
    <div className="mb-6">
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-3">
        Notes
      </p>
      <div className="bg-surface-white rounded-xl border border-kraft-border px-4 py-4">
        <textarea
          {...register('notes')}
          rows={3}
          maxLength={500}
          placeholder="Any special requests? (optional)"
          className={cn(
            'w-full border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:ring-2 focus:ring-crust-gold/40 transition-shadow resize-none bg-transparent',
            errors.notes ? 'border-red-400' : 'border-kraft-border'
          )}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.notes && <p className="font-sans text-red-600 text-xs">{errors.notes.message}</p>}
          </div>
          <span className="font-sans text-[10px] text-ink-light tracking-wider uppercase">
            {notes.length}/500
          </span>
        </div>
      </div>
    </div>
  )
}
