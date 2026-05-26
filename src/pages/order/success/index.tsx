import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useOrderSuccess } from './hooks/useOrderSuccess'
import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type PaymentTab = 'bank_transfer' | 'qris'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [activeTab, setActiveTab] = useState<PaymentTab>('bank_transfer')

  const { data: order, isLoading } = useOrderSuccess(orderId)

  const orderItems = order?.order_items ?? []
  const total = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Confirmation header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Order placed!</h1>
          {order && (
            <p className="text-stone-500 text-sm">
              Thanks, {order.customer_name}. Please complete your payment below.
            </p>
          )}
          {!order && !isLoading && (
            <p className="text-stone-500 text-sm">
              Your order has been received. Please complete your payment below.
            </p>
          )}
        </div>

        {/* Bill summary */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-4">
            <p className="font-bold text-stone-800 text-sm mb-3">🧾 Your Order</p>
            <div className="space-y-2 mb-3">
              {orderItems.map((oi) => {
                const si = oi.preorder_session_items
                const name = si?.menu_items?.name ?? 'Item'
                const price = si?.price ?? 0
                return (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">{name} ×{oi.quantity}</span>
                    <span className="font-medium text-stone-800">{formatRupiah(price * oi.quantity)}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
            </div>
          </div>
        )}

        {/* Payment instructions */}
        <div className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
          <div className="px-5 pt-4 pb-0">
            <p className="font-bold text-stone-800 text-sm mb-3">💳 Complete Payment</p>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('bank_transfer')}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  activeTab === 'bank_transfer'
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                Bank Transfer
              </button>
              <div className="relative">
                <button
                  type="button"
                  disabled
                  className="text-xs font-semibold px-4 py-2 rounded-full border bg-white border-stone-200 text-stone-300 cursor-not-allowed"
                >
                  QRIS
                </button>
                <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-stone-200 text-stone-500 rounded-full px-1.5 py-0.5 leading-none">
                  Soon
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            {activeTab === 'bank_transfer' && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-amber-800 text-sm leading-relaxed">
                  {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong>
                  <br />a/n <strong>{BANK_INFO.accountHolder}</strong>
                  {total > 0 && (
                    <>
                      <br />
                      <span className="text-amber-700">
                        Amount: <strong>{formatRupiah(total)}</strong>
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
            {activeTab === 'qris' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-48 h-48 bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200">
                  <div className="text-center text-stone-400">
                    <p className="text-4xl mb-2">📱</p>
                    <p className="text-xs font-medium">QRIS Coming Soon</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 text-center">
                  Scan with your banking or e-wallet app to pay
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload proof CTA */}
        {orderId && (
          <Link
            to={`/upload-proof?orderId=${orderId}`}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors mb-3"
          >
            I've Paid — Upload Proof →
          </Link>
        )}

        {/* Reassurance */}
        <p className="text-center text-xs text-stone-400 mb-4">
          Don't worry — you can always come back to see your order detail on the orders page.
        </p>

      </div>
    </div>
  )
}
