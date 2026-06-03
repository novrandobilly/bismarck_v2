import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useOrderSuccess } from "./hooks/useOrderSuccess";
import { BANK_INFO } from "@/lib/bankInfo";
import { formatRupiah } from "@/tools/formatRupiah";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: order, isLoading } = useOrderSuccess(orderId);

  const orderItems = order?.order_items ?? [];
  const total = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0;
    return sum + price * oi.quantity;
  }, 0);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">
        {/* Confirmation header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Order placed!
          </h1>
          <p className="text-stone-500 text-sm">
            {order ? `Thanks, ${order.customer_name}. ` : ""}Complete your
            payment to confirm.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {/* Order + Payment — one card */}
        {!isLoading && (
          <div className="bg-white rounded-2xl border border-stone-200 mb-5 overflow-hidden">
            {/* Order items */}
            {orderItems.length > 0 && (
              <div className="px-5 pt-5 pb-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                  Your Order
                </p>
                {orderItems.map((oi) => {
                  const si = oi.preorder_session_items;
                  const name = si?.menu_items?.name ?? "Item";
                  const price = si?.price ?? 0;
                  return (
                    <div key={oi.id} className="flex justify-between text-sm">
                      <span className="text-stone-600">
                        {name} ×{oi.quantity}
                      </span>
                      <span className="font-medium text-stone-800">
                        {formatRupiah(price * oi.quantity)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-3 border-t border-stone-100">
                  <span className="font-bold text-stone-900 text-sm">
                    Total
                  </span>
                  <span className="font-bold text-amber-500">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="border-t border-stone-100 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Pay to
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {BANK_INFO.bank} ·{" "}
                <strong className="text-stone-900">
                  {BANK_INFO.accountNumber}
                </strong>
                <br />
                a/n {BANK_INFO.accountHolder}
              </p>
              {total > 0 && (
                <p className="text-sm text-amber-600 font-semibold mt-1">
                  {formatRupiah(total)}
                </p>
              )}
              <p className="text-xs text-stone-400 mt-3">QRIS coming soon</p>
            </div>
          </div>
        )}

        {/* Upload proof CTA or paid confirmation */}
        {orderId &&
          (order?.has_paid ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-4">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Payment confirmed
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Your order is being prepared.
                </p>
              </div>
            </div>
          ) : (
            <Link
              to={`/upload-proof?orderId=${orderId}`}
              className="block w-full bg-amber-500 hover:bg-amber-600 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors mb-4"
            >
              I've Paid — Upload Proof →
            </Link>
          ))}

        {/* Save link — subtle row */}
        <div className="border border-dashed border-stone-300 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-stone-500 mb-2">🔗 Save this link to upload proof later</p>
          <div className="flex items-start gap-2">
            <p className="text-xs text-stone-400 break-all font-mono flex-1 select-all leading-relaxed">
              {window.location.href}
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="cursor-pointer shrink-0 text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              {linkCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
