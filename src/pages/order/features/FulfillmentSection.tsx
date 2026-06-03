import type { UseFormReturn } from 'react-hook-form'
import type { OrderFormValues } from '@/types/order'
import type { Session, CustomLocation } from '@/types/session'
import { cn } from '@/lib/utils/cn'

interface Props {
  form: UseFormReturn<OrderFormValues>
  session: Session
}

type OptionKey = string // 'pickup' | 'delivery' | 'custom:<name>'

export function FulfillmentSection({ form, session }: Props) {
  const { register, watch, setValue, formState: { errors } } = form
  const fulfillmentType = watch('fulfillment_type')
  const customLocation = watch('custom_location')

  const options: { key: OptionKey; label: string; sublabel?: string }[] = [
    ...(session.allow_pickup ? [{ key: 'pickup', label: '🛍 Self Pickup' }] : []),
    ...(session.allow_delivery ? [{ key: 'delivery', label: '🚚 Delivery (additional fee)' }] : []),
    ...(session.custom_locations ?? []).map((loc: CustomLocation) => ({
      key: `custom:${loc.name}`,
      label: `📍 ${loc.name}`,
      sublabel: loc.time,
    })),
  ]

  const currentKey = fulfillmentType === 'custom'
    ? `custom:${customLocation}`
    : fulfillmentType

  function handleSelect(key: OptionKey) {
    if (key.startsWith('custom:')) {
      setValue('fulfillment_type', 'custom', { shouldValidate: true })
      setValue('custom_location', key.slice('custom:'.length), { shouldValidate: true })
    } else {
      setValue('fulfillment_type', key as 'pickup' | 'delivery', { shouldValidate: true })
      setValue('custom_location', '')
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-stone-800 mb-3">Fulfillment</h2>
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
        {options.map(opt => (
          <label key={opt.key} className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelect(opt.key)}>
            <input
              type="radio"
              readOnly
              checked={currentKey === opt.key}
              className="accent-amber-500"
            />
            <div>
              <span className="text-sm text-stone-700">{opt.label}</span>
              {opt.sublabel && <p className="text-xs text-stone-500">{opt.sublabel}</p>}
            </div>
          </label>
        ))}
        {fulfillmentType === 'delivery' && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Delivery Address</label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              placeholder="Full address including RT/RW, kelurahan, etc."
              className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none', errors.delivery_address ? 'border-red-400' : 'border-stone-300')}
            />
            {errors.delivery_address && <p className="text-red-500 text-xs mt-1">{errors.delivery_address.message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
