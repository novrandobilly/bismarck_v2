import { useParams, Link } from "react-router-dom";
import { useSessionOrdersPublic } from "./hooks/useSessionOrdersPublic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Order } from "@/types/order";
import { cn } from "@/lib/utils/cn";
import { useModal } from "@/lib/modal/useModal";
import { BillModal } from "@/components/BillModal";
import { BANK_INFO } from "@/lib/bankInfo";

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "**";
  return "*".repeat(digits.length - 2) + digits.slice(-2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({
  order,
  index,
  onViewBill,
}: {
  order: Order;
  index: number;
  onViewBill: () => void;
}) {
  const orderItems = order.order_items ?? [];

  return (
    <div
      className={cn(
        "bg-surface-white rounded-xl border border-kraft-border px-5 py-4 flex items-start gap-4",
        order.is_fulfilled ? "opacity-60" : "",
      )}
    >
      <div className="w-8 h-8 rounded-full bg-flour-dust border border-kraft-border flex items-center justify-center text-xs font-bold font-sans text-ink-medium shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="font-sans font-semibold text-ink-dark text-sm">
              {maskName(order.customer_name)}
            </p>
            <p className="font-sans text-ink-light text-xs mt-0.5">
              {maskPhone(order.whatsapp)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "font-sans text-xs font-semibold px-2.5 py-1 rounded-full",
                order.is_fulfilled
                  ? "bg-session-open-bg text-session-open-text"
                  : "bg-flour-dust text-ink-medium",
              )}
            >
              {order.is_fulfilled ? "✓ Ready" : "Processing"}
            </span>
            <button
              type="button"
              onClick={onViewBill}
              className="cursor-pointer font-sans text-xs font-semibold bg-ink-dark hover:bg-ink-medium text-surface-white px-3 py-1 rounded-full transition-colors"
            >
              View Bill
            </button>
          </div>
        </div>
        {orderItems.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {orderItems.map((oi) => {
              const name = oi.preorder_session_items?.menu_items?.name ?? "Item";
              return (
                <p key={oi.id} className="font-sans text-xs text-ink-medium">
                  {oi.quantity}× {name}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionOrdersPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, isError } = useSessionOrdersPublic(sessionId);
  const { open } = useModal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-cream">
        <LoadingSpinner centered />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4 text-center">
        <div>
          <p className="font-serif text-lg font-semibold text-ink-dark mb-1">Session not found</p>
          <Link
            to="/"
            className="font-sans text-crust-gold text-sm mt-2 inline-block hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { session, orders } = data;
  const fulfilled = orders.filter((o) => o.is_fulfilled).length;

  return (
    <div className="min-h-screen bg-warm-cream">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="font-sans text-xs text-ink-light hover:text-ink-dark mb-3 inline-flex items-center gap-1 transition-colors"
          >
            ← Home
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ink-dark">{session.title}</h1>
          <p className="font-sans text-ink-medium text-sm mt-0.5">
            Pick-up: {formatDate(session.fulfillment_date)}
          </p>
        </div>

        <div className="bg-surface-white rounded-xl border border-kraft-border px-5 py-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-serif text-2xl font-bold text-ink-dark">{orders.length}</p>
            <p className="font-sans text-xs text-ink-light mt-0.5">Total orders</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-2xl font-bold text-session-open-text">{fulfilled}</p>
            <p className="font-sans text-xs text-ink-light mt-0.5">Ready for pickup</p>
          </div>
          <div className="flex-1 max-w-30">
            <div className="h-1.5 bg-flour-dust rounded-full overflow-hidden">
              <div
                className="h-full bg-session-open-dot rounded-full transition-all"
                style={{
                  width: orders.length ? `${(fulfilled / orders.length) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="font-sans text-xs text-ink-light mt-1 text-right">
              {orders.length ? Math.round((fulfilled / orders.length) * 100) : 0}% ready
            </p>
          </div>
        </div>

        <div className="bg-crust-gold-light border border-kraft-border rounded-xl px-5 py-4 mb-6">
          <p className="font-serif font-semibold text-ink-dark text-sm mb-1">How to Pay</p>
          <p className="font-sans text-ink-medium text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong className="text-ink-dark">{BANK_INFO.accountNumber}</strong> · a/n{" "}
            <strong className="text-ink-dark">{BANK_INFO.accountHolder}</strong>
          </p>
          <p className="font-sans text-ink-medium text-xs mt-1">
            Forgot your bill? Tap <strong>View Bill</strong> next to your name below.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-lg font-semibold text-ink-dark mb-1">No orders yet</p>
            <p className="font-sans text-ink-medium text-sm">Be the first to order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-medium mb-2">
              Order List
            </p>
            {orders.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                index={i}
                onViewBill={() => open(<BillModal order={order} />)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
