import { useEffect } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import type { Session } from '@/types/session'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  fulfillment_date: z.string().min(1, 'Fulfillment date is required'),
  order_deadline: z.string().min(1, 'Order deadline is required'),
  max_orders: z.coerce.number().int().min(0).default(0),
  allow_pickup: z.boolean().default(true),
  allow_delivery: z.boolean().default(false),
  custom_locations: z.array(z.object({ name: z.string().min(1, 'Name is required'), time: z.string().min(1, 'Time is required') })),
})

type FormValues = z.infer<typeof schema>

interface Props {
  session: Session
  onSave: (data: FormValues) => void
  onClose: () => void
  isSaving: boolean
  saveError?: string | null
}

function formatToLocalDate(isoString: string): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatToLocalDateTime(isoString: string): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function EditSessionModal({ session, onSave, onClose, isSaving, saveError }: Props) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  })

  useEffect(() => {
    reset({
      title: session.title,
      description: session.description || '',
      fulfillment_date: formatToLocalDate(session.fulfillment_date),
      order_deadline: formatToLocalDateTime(session.order_deadline),
      max_orders: session.max_orders,
      allow_pickup: session.allow_pickup,
      allow_delivery: session.allow_delivery,
      custom_locations: session.custom_locations || [],
    })
  }, [session, reset])

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: 'custom_locations',
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-stone-800">Edit Pre-Order Session</h2>
          <button type="button" onClick={onClose} className="cursor-pointer text-stone-400 hover:text-stone-600 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                {...register('title')}
                placeholder="e.g. Bagel Batch — May 22"
                className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.title ? 'border-red-400' : 'border-stone-300')}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description (optional)</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Dates & Capacity */}
          <div className="border-t border-stone-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Schedule & Capacity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fulfillment Date</label>
                <input
                  {...register('fulfillment_date')}
                  type="date"
                  className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.fulfillment_date ? 'border-red-400' : 'border-stone-300')}
                />
                {errors.fulfillment_date && <p className="text-red-500 text-xs mt-1">{errors.fulfillment_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Order Deadline</label>
                <input
                  {...register('order_deadline')}
                  type="datetime-local"
                  className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.order_deadline ? 'border-red-400' : 'border-stone-300')}
                />
                {errors.order_deadline && <p className="text-red-500 text-xs mt-1">{errors.order_deadline.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Orders (0 = unlimited)</label>
              <input
                {...register('max_orders', { valueAsNumber: true })}
                type="number"
                min={0}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Fulfillment Options */}
          <div className="border-t border-stone-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Fulfillment Options</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('allow_pickup')} type="checkbox" className="accent-amber-500" />
                <span className="text-sm text-stone-700">Allow Self Pickup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('allow_delivery')} type="checkbox" className="accent-amber-500" />
                <span className="text-sm text-stone-700">Allow Delivery</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Drop-off Locations</span>
                <button
                  type="button"
                  onClick={() => appendLocation({ name: '', time: '' })}
                  className="cursor-pointer text-xs text-amber-600 hover:underline"
                >
                  + Add Location
                </button>
              </div>
              {locationFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input
                      {...register(`custom_locations.${idx}.name`)}
                      placeholder="Location name"
                      className={cn(
                        'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                        errors.custom_locations?.[idx]?.name ? 'border-red-400' : 'border-stone-300'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      {...register(`custom_locations.${idx}.time`)}
                      placeholder="Time (e.g. 10:00 AM)"
                      className={cn(
                        'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                        errors.custom_locations?.[idx]?.time ? 'border-red-400' : 'border-stone-300'
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocation(idx)}
                    className="cursor-pointer text-stone-400 hover:text-red-500 px-2 self-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {saveError && <p className="text-red-500 text-xs">{saveError}</p>}

          <div className="flex gap-3 pt-3 border-t border-stone-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 border border-stone-300 text-stone-700 rounded-xl py-2.5 text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
