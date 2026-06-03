import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMenuItems } from '@/hooks/useMenuItems'
import { useCreateSession, type SessionFormValues } from './hooks/useCreateSession'
import { useSlugAvailability } from './hooks/useSlugAvailability'
import { slugify } from '@/tools/slugify'
import { cn } from '@/lib/utils/cn'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be 50 characters or less')
    .regex(slugRegex, 'Only lowercase letters, numbers, and hyphens (e.g. bagel-juni-w1)'),
  description: z.string().default(''),
  fulfillment_date: z.string().min(1, 'Fulfillment date is required'),
  order_deadline: z.string().min(1, 'Order deadline is required'),
  max_orders: z.coerce.number().int().min(0).default(0),
  allow_pickup: z.boolean().default(true),
  allow_delivery: z.boolean().default(false),
  custom_locations: z.array(z.object({ name: z.string().min(1), time: z.string().min(1) })),
  selectedItems: z.array(z.object({
    menu_item_id: z.string(),
    price: z.number().min(0),
    is_available: z.boolean(),
    selected: z.boolean(),
  })),
})

type FormValues = z.infer<typeof schema>

export default function SessionNewPage() {
  const navigate = useNavigate()
  const { data: menuItems = [] } = useMenuItems()
  const { mutate: createSession, isPending, error } = useCreateSession()

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: '', slug: '', description: '', fulfillment_date: '', order_deadline: '',
      max_orders: 0, allow_pickup: true, allow_delivery: false,
      custom_locations: [], selectedItems: [],
    },
  })

  const slugTouched = useRef(false)
  const title = watch('title')
  const slug = watch('slug')
  const slugStatus = useSlugAvailability(slug)

  // Auto-fill slug from title until the user manually edits the slug field
  useEffect(() => {
    if (!slugTouched.current) {
      setValue('slug', slugify(title), { shouldValidate: title.length > 0 })
    }
  }, [title, setValue])

  useEffect(() => {
    if (menuItems.length > 0) {
      reset(current => ({
        ...current,
        selectedItems: menuItems
          .filter(m => m.is_active)
          .map(m => ({ menu_item_id: m.id, price: m.default_price, is_available: true, selected: true })),
      }))
    }
  }, [menuItems, reset])

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({ control, name: 'custom_locations' })
  const { fields: itemFields } = useFieldArray({ control, name: 'selectedItems' })

  function onSubmit(values: FormValues) {
    const sessionValues: SessionFormValues = {
      ...values,
      selectedItems: values.selectedItems
        .filter(i => i.selected)
        .map(({ menu_item_id, price, is_available }) => ({ menu_item_id, price, is_available })),
    }
    createSession(sessionValues, {
      onSuccess: (session) => navigate(`/bismarck/sessions/${session.id}`),
      onError: (err) => console.error('Session create error:', JSON.stringify((err as any)?.response?.data ?? err, null, 2)),
    })
  }

  const activeMenuItems = menuItems.filter(m => m.is_active)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">New Pre-Order Session</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Batch Info */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-stone-700">Batch Info</h2>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input {...register('title')} placeholder="e.g. Bagel Batch — May 22" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.title ? 'border-red-400' : 'border-stone-300')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Shareable Link Slug</label>
              <div className={cn('flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-400', errors.slug ? 'border-red-400' : slugStatus === 'taken' ? 'border-red-400' : 'border-stone-300')}>
                <span className="px-3 py-2 text-xs text-stone-400 bg-stone-50 border-r border-stone-200 shrink-0">/order/</span>
                <input
                  {...register('slug')}
                  placeholder="e.g. bagel-juni-w1"
                  className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                  onChange={e => {
                    slugTouched.current = true
                    register('slug').onChange(e)
                  }}
                />
                {slug.length >= 3 && (
                  <span className="px-3 text-xs shrink-0">
                    {slugStatus === 'checking' && <span className="text-stone-400">…</span>}
                    {slugStatus === 'available' && <span className="text-green-600">✓ available</span>}
                    {slugStatus === 'taken' && <span className="text-red-500">✗ taken</span>}
                  </span>
                )}
              </div>
              {errors.slug
                ? <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                : slugStatus === 'taken'
                  ? <p className="text-red-500 text-xs mt-1">This slug is already in use. Please choose a different one.</p>
                  : <p className="text-stone-400 text-xs mt-1">Auto-filled from title. Lowercase letters, numbers, hyphens only.</p>
              }
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description (optional)</label>
              <textarea {...register('description')} rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fulfillment Date (D-Day)</label>
                <input {...register('fulfillment_date')} type="date" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.fulfillment_date ? 'border-red-400' : 'border-stone-300')} />
                {errors.fulfillment_date && <p className="text-red-500 text-xs mt-1">{errors.fulfillment_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Order Deadline</label>
                <input {...register('order_deadline')} type="datetime-local" className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400', errors.order_deadline ? 'border-red-400' : 'border-stone-300')} />
                {errors.order_deadline && <p className="text-red-500 text-xs mt-1">{errors.order_deadline.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Max Orders (0 = unlimited)</label>
              <input {...register('max_orders', { valueAsNumber: true })} type="number" min={0} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          {/* Fulfillment Options */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-stone-700">Fulfillment Options</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('allow_pickup')} type="checkbox" className="accent-amber-500" />
              <span className="text-sm text-stone-700">Allow Self Pickup</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('allow_delivery')} type="checkbox" className="accent-amber-500" />
              <span className="text-sm text-stone-700">Allow Delivery</span>
            </label>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Drop-off Locations</span>
                <button type="button" onClick={() => appendLocation({ name: '', time: '' })} className="cursor-pointer text-xs text-amber-600 hover:underline">+ Add Location</button>
              </div>
              {locationFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input {...register(`custom_locations.${idx}.name`)} placeholder="Location name" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  <input {...register(`custom_locations.${idx}.time`)} placeholder="Time (e.g. 10:00 AM)" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  <button type="button" onClick={() => removeLocation(idx)} className="cursor-pointer text-stone-400 hover:text-red-500 px-2">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-stone-700">Menu Items for This Session</h2>
            {activeMenuItems.length === 0 && <p className="text-stone-400 text-sm">No active menu items. Add some in the Menu Catalog first.</p>}
            {itemFields.map((field, idx) => {
              const menuItem = activeMenuItems.find(m => m.id === field.menu_item_id)
              if (!menuItem) return null
              return (
                <div key={field.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <Controller
                    control={control}
                    name={`selectedItems.${idx}.selected`}
                    render={({ field: f }) => (
                      <input type="checkbox" checked={f.value} onChange={f.onChange} className="accent-amber-500" />
                    )}
                  />
                  <span className="flex-1 text-sm text-stone-800">{menuItem.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-500">IDR</span>
                    <input {...register(`selectedItems.${idx}.price`, { valueAsNumber: true })} type="number" min={0} className="w-24 border border-stone-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
              )
            })}
          </div>

          {error && <p className="text-red-500 text-sm">Failed to create session. Please try again.</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/bismarck/dashboard')} className="cursor-pointer flex-1 border border-stone-300 text-stone-700 rounded-xl py-3 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending || slugStatus === 'taken'} className="cursor-pointer flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors">
              {isPending ? 'Creating...' : 'Open Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
