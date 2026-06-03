import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import { cn } from '@/lib/utils/cn'

interface Props { form: UseFormReturn<OrderFormValues> }

export function CustomerDetails({ form }: Props) {
  const { register, formState: { errors } } = form
  return (
    <div className="mb-6">
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-3">
        Your Details
      </p>
      <div className="bg-surface-white rounded-xl border border-kraft-border px-4 py-4 space-y-4">
        <div>
          <label className="block font-sans text-sm font-medium text-ink-dark mb-1">Name</label>
          <input
            {...register('customer_name')}
            type="text"
            placeholder="Your full name"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:ring-2 focus:ring-crust-gold/40 transition-shadow', errors.customer_name ? 'border-red-400' : 'border-kraft-border')}
          />
          {errors.customer_name && <p className="font-sans text-red-600 text-xs mt-1">{errors.customer_name.message}</p>}
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-ink-dark mb-1">WhatsApp Number</label>
          <input
            {...register('whatsapp')}
            type="tel"
            placeholder="e.g. 08123456789"
            className={cn('w-full border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:ring-2 focus:ring-crust-gold/40 transition-shadow', errors.whatsapp ? 'border-red-400' : 'border-kraft-border')}
          />
          {errors.whatsapp && <p className="font-sans text-red-600 text-xs mt-1">{errors.whatsapp.message}</p>}
        </div>
      </div>
    </div>
  )
}
