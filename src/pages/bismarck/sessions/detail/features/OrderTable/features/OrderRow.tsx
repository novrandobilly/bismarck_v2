import type { Order } from '@/types/order'
import { cn } from '@/lib/utils/cn'
import { useModal } from '@/lib/modal/useModal'

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

// ── Receipt Modal ──────────────────────────────────────────────────────────

function PaymentReceiptModal({ order, total }: { order: Order; total: number }) {
  const { close } = useModal()

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-stone-800 text-base">Payment Receipt</h3>
        <button type="button" onClick={close} className="cursor-pointer text-stone-400 hover:text-stone-600 text-lg leading-none">✕</button>
      </div>

      <p className="text-sm font-medium text-stone-700 mb-1">{order.customer_name}</p>
      <p className="text-xs text-stone-400 font-mono mb-3">{order.id.slice(0, 8)}…</p>

      {/* Status badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={cn(
          'text-xs font-semibold px-2 py-1 rounded-full',
          order.has_paid ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500',
        )}>
          {order.has_paid ? '✓ Paid' : 'Unpaid'}
        </span>
        {order.payment_method && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full capitalize">
            {order.payment_method.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Order items */}
      <div className="space-y-1.5 mb-3">
        {(order.order_items ?? []).map(oi => (
          <div key={oi.id} className="flex justify-between text-sm">
            <span className="text-stone-600">
              {oi.preorder_session_items?.menu_items?.name ?? 'Item'} ×{oi.quantity}
            </span>
            <span className="text-stone-700 font-medium">
              {idr.format((oi.preorder_session_items?.price ?? 0) * oi.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-bold text-sm border-t border-stone-100 pt-2.5 mb-5">
        <span className="text-stone-800">Total</span>
        <span className="text-amber-600">{idr.format(total)}</span>
      </div>

      {/* Receipt image */}
      <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-2">Receipt</p>
      {order.payment_proof_url ? (
        <div>
          <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
            <img
              src={order.payment_proof_url}
              alt="Payment receipt"
              className="w-full rounded-xl border border-stone-200 hover:opacity-90 transition-opacity"
            />
          </a>
          <p className="text-xs text-stone-400 mt-1.5 text-center">Tap image to view full size</p>
        </div>
      ) : (
        <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-6 text-center">
          <p className="text-stone-400 text-sm">No receipt uploaded yet</p>
        </div>
      )}
    </div>
  )
}

// ── Order Row ──────────────────────────────────────────────────────────────

interface Props {
  order: Order
  onToggleFulfilled: (order: Order) => void
  isToggling: boolean
}

export function OrderRow({ order, onToggleFulfilled, isToggling }: Props) {
  const { open } = useModal()
  const orderItems = order.order_items ?? []
  const fulfillmentLabel: Record<string, string> = {
    pickup: 'Pickup',
    delivery: 'Delivery',
    custom: order.custom_location || 'Drop-off',
  }

  const orderTotal = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  function handleViewReceipt() {
    open(<PaymentReceiptModal order={order} total={orderTotal} />)
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
        <p className="text-stone-400 text-xs">{order.whatsapp}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-stone-500">{fulfillmentLabel[order.fulfillment_type]}</p>
        {order.delivery_address && <p className="text-xs text-stone-400 mt-0.5 max-w-[160px] truncate">{order.delivery_address}</p>}
      </td>
      <td className="py-3 px-4">
        {order.notes ? (
          <p className="text-xs text-stone-600 whitespace-pre-line max-w-[200px] break-words">
            {order.notes}
          </p>
        ) : (
          <span className="text-xs text-stone-300 italic">-</span>
        )}
      </td>
      <td className="py-3 px-4">
        {orderItems.map(oi => {
          const name = oi.preorder_session_items?.menu_items?.name ?? 'Item'
          const price = oi.preorder_session_items?.price ?? 0
          return (
            <p key={oi.id} className="text-xs text-stone-600">
              {oi.quantity}x {name}
              <span className="text-stone-400 ml-1.5">{idr.format(price * oi.quantity)}</span>
            </p>
          )
        })}
      </td>
      <td className="py-3 px-4 text-right">
        <p className="text-sm font-semibold text-stone-700 mb-1.5">{idr.format(orderTotal)}</p>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleViewReceipt}
            className={cn(
              'cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
              order.payment_proof_url
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100',
            )}
          >
            {order.payment_proof_url ? '🧾 View Receipt' : '📎 No Receipt'}
          </button>
          <button
            type="button"
            onClick={() => onToggleFulfilled(order)}
            disabled={isToggling}
            className={cn(
              'cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
              order.is_fulfilled
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100',
            )}
          >
            {order.is_fulfilled ? '✓ Done' : 'Mark Done'}
          </button>
        </div>
      </td>
    </tr>
  )
}
