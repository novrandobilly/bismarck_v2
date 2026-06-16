import { Link } from "react-router-dom";
import type { Session } from "@/types/session";
import { formatDate } from "../../../utils/formatDate";

interface OpenPOBannerProps {
  session: Session;
}

export function OpenPOBanner({ session }: OpenPOBannerProps) {
  return (
    <div className="bg-crust-gold-light border border-kraft-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-session-open-text bg-session-open-bg rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-session-open-dot animate-pulse" />
          Pre-Order Open
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold text-ink-dark leading-snug mb-1">
        {session.title}
      </h3>
      {session.description && (
        <p className="font-sans text-ink-medium text-sm mb-3 leading-relaxed">
          {session.description}
        </p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 font-sans text-xs text-ink-medium">
        <span>Ready {formatDate(session.fulfillment_date)}</span>
        <span>·</span>
        <span>Order by {formatDate(session.order_deadline)}</span>
      </div>
      <Link
        to={`/order/${session.slug}`}
        className="inline-block bg-crust-gold hover:bg-crust-gold-deep text-ink-dark font-sans font-semibold rounded-[14px] px-6 py-3 text-sm transition-colors w-full sm:w-auto text-center"
      >
        Order Now
      </Link>
    </div>
  );
}
