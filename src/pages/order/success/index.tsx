import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useOrderSuccess } from "./hooks/useOrderSuccess";
import { BANK_INFO } from "@/lib/bankInfo";
import { formatRupiah } from "@/tools/formatRupiah";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type PaymentTab = "transfer" | "qris";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [linkCopied, setLinkCopied] = useState(false);
  const [paymentTab, setPaymentTab] = useState<PaymentTab>("transfer");

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
    <div className="min-h-screen bg-warm-cream">
      <div className="max-w-md mx-auto px-4 py-10">
        {/* Confirmation header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-session-open-bg border border-session-open-dot/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-session-open-text text-xl font-bold">✓</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-dark mb-1">
            Order placed!
          </h1>
          <p className="font-sans text-ink-medium text-sm">
            {order ? `Thanks, ${order.customer_name}. ` : ""}Complete your
            payment to confirm.
          </p>
        </div>

        {isLoading && <LoadingSpinner centered />}

        {/* Order + Payment */}
        {!isLoading && (
          <div className="bg-surface-white rounded-2xl border border-kraft-border mb-5 overflow-hidden">
            {/* Order items */}
            {orderItems.length > 0 && (
              <div className="px-5 pt-5 pb-4 space-y-2">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-medium mb-3">
                  Your Order
                </p>
                {orderItems.map((oi) => {
                  const si = oi.preorder_session_items;
                  const name = si?.menu_items?.name ?? "Item";
                  const price = si?.price ?? 0;
                  return (
                    <div key={oi.id} className="flex justify-between text-sm">
                      <span className="font-sans text-ink-medium">
                        {name} ×{oi.quantity}
                      </span>
                      <span className="font-sans font-medium text-ink-dark">
                        {formatRupiah(price * oi.quantity)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-3 border-t border-kraft-border-soft">
                  <span className="font-sans font-semibold text-ink-dark text-sm">
                    Total
                  </span>
                  <span className="font-sans font-bold text-crust-gold">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment tabs */}
            <div className="border-t border-kraft-border">
              {/* Tab bar */}
              <div className="flex border-b border-kraft-border">
                <button
                  type="button"
                  onClick={() => setPaymentTab("transfer")}
                  className={`flex-1 py-3 font-sans text-[13px] font-semibold transition-colors ${
                    paymentTab === "transfer"
                      ? "text-ink-dark border-b-2 border-crust-gold -mb-px"
                      : "text-ink-light hover:text-ink-medium"
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab("qris")}
                  className={`flex-1 py-3 font-sans text-[13px] font-semibold transition-colors ${
                    paymentTab === "qris"
                      ? "text-ink-dark border-b-2 border-crust-gold -mb-px"
                      : "text-ink-light hover:text-ink-medium"
                  }`}
                >
                  QRIS
                </button>
              </div>

              {/* Bank Transfer panel */}
              {paymentTab === "transfer" && (
                <div className="px-5 py-4">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-medium mb-3">
                    Pay to
                  </p>
                  <p className="font-sans text-sm text-ink-medium leading-relaxed">
                    {BANK_INFO.bank} ·{" "}
                    <strong className="font-semibold text-ink-dark">
                      {BANK_INFO.accountNumber}
                    </strong>
                    <br />
                    a/n {BANK_INFO.accountHolder}
                  </p>
                  {total > 0 && (
                    <p className="font-sans text-sm font-bold text-crust-gold mt-2">
                      {formatRupiah(total)}
                    </p>
                  )}
                </div>
              )}

              {/* QRIS panel */}
              {paymentTab === "qris" && (
                <div className="px-5 py-5 flex flex-col items-center text-center">
                  {/* QR placeholder */}
                  <div className="w-44 h-44 rounded-xl border-2 border-kraft-border bg-flour-dust flex flex-col items-center justify-center mb-3">
                    {/* Minimal QR pattern using CSS grid */}
                    <div className="grid grid-cols-7 gap-[2px] opacity-30 mb-2" aria-hidden>
                      {[
                        1,1,1,1,1,1,1,
                        1,0,0,0,0,0,1,
                        1,0,1,0,1,0,1,
                        1,0,0,0,0,0,1,
                        1,0,1,0,1,0,1,
                        1,0,0,0,0,0,1,
                        1,1,1,1,1,1,1,
                      ].map((cell, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-[1px] ${cell ? "bg-ink-dark" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                    <p className="font-sans text-[10px] font-bold text-ink-medium uppercase tracking-widest mt-1">
                      QRIS
                    </p>
                  </div>

                  <p className="font-sans text-xs font-semibold text-ink-dark mb-0.5">
                    Envien Bagel
                  </p>
                  <p className="font-sans text-[11px] text-ink-light mb-3">
                    Merchant BCA — QRIS
                  </p>

                  {total > 0 && (
                    <p className="font-sans text-sm font-bold text-crust-gold mb-3">
                      {formatRupiah(total)}
                    </p>
                  )}

                  <p className="font-sans text-[11px] text-ink-light leading-relaxed max-w-[22ch]">
                    Scan with any mobile banking or e-wallet app
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload proof CTA or paid confirmation */}
        {orderId &&
          (order?.has_paid ? (
            <div className="flex items-center gap-3 bg-session-open-bg border border-session-open-dot/20 rounded-2xl px-5 py-4 mb-4">
              <span className="text-session-open-text text-xl font-bold">✓</span>
              <div>
                <p className="font-sans text-sm font-semibold text-session-open-text">
                  Payment confirmed
                </p>
                <p className="font-sans text-xs text-session-open-text/80 mt-0.5">
                  Your order is being prepared.
                </p>
              </div>
            </div>
          ) : (
            <Link
              to={`/upload-proof?orderId=${orderId}`}
              className="block w-full bg-crust-gold hover:bg-crust-gold-deep text-ink-dark text-center font-sans font-semibold text-sm py-3.5 rounded-[14px] transition-colors mb-4"
            >
              I've Paid — Upload Proof
            </Link>
          ))}

        {/* Save link */}
        <div className="border border-dashed border-kraft-border rounded-xl px-4 py-3">
          <p className="font-sans text-xs font-semibold text-ink-medium mb-2">Save this link to upload proof later</p>
          <div className="flex items-start gap-2">
            <p className="font-sans text-xs text-ink-light break-all font-mono flex-1 select-all leading-relaxed">
              {window.location.href}
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="cursor-pointer shrink-0 text-xs font-semibold font-sans text-crust-gold hover:text-crust-gold-deep transition-colors"
            >
              {linkCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
