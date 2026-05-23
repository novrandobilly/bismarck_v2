import { usePendingPayments } from './hooks/usePendingPayments'
import { useMarkPaid } from './hooks/useMarkPaid'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRupiah } from '@/tools/formatRupiah'
import type { Order } from '@/types/order'

function PaymentRow({ order, onMarkPaid, isMarking }: {
  order: Order
  onMarkPaid: (id: string) => void
  isMarking: boolean
}) {
  const orderTotal = (order.order_items ?? []).reduce((sum, oi) => {
    return sum + (oi.preorder_session_items?.price ?? 0) * oi.quantity
  }, 0)

  const methodLabel = order.payment_method === 'qris' ? 'QRIS' : 'Bank Transfer'

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
        <p className="text-stone-400 text-xs font-mono">{order.id.slice(0, 8)}…</p>
      </td>
      <td className="py-3 px-4 text-sm text-stone-600">
        {order.whatsapp.slice(-4).padStart(order.whatsapp.length, '•')}
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-stone-700">
        {formatRupiah(orderTotal)}
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          order.payment_method === 'qris'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {methodLabel}
        </span>
      </td>
      <td className="py-3 px-4">
        {order.payment_proof_url ? (
          <a
            href={order.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-12 h-12 rounded-lg overflow-hidden border border-stone-200 hover:border-amber-400 transition-colors"
          >
            <img
              src={order.payment_proof_url}
              alt="Payment proof"
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <span className="text-xs text-stone-400">No image</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          disabled={isMarking}
          onClick={() => onMarkPaid(order.id)}
          className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isMarking ? '…' : '✓ Mark as Paid'}
        </button>
      </td>
    </tr>
  )
}

export default function PaymentsPage() {
  const { data: orders = [], isLoading } = usePendingPayments()
  const { mutate: markPaid, isPending: isMarking, variables: markingId } = useMarkPaid()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Payments</h1>
        <p className="text-stone-500 text-sm mb-6">
          Orders with uploaded payment proof awaiting your approval.
        </p>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner centered />
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-medium text-stone-600">No pending payment proofs</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Total</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Method</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Proof</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <PaymentRow
                    key={order.id}
                    order={order}
                    onMarkPaid={markPaid}
                    isMarking={isMarking && markingId === order.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
