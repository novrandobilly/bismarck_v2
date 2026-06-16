import type { Session } from "@/types/session";
import { formatDate } from "../../../utils/formatDate";

interface PastSessionCardProps {
  session: Session;
}

export function PastSessionCard({ session }: PastSessionCardProps) {
  return (
    <div className="bg-surface-white border border-kraft-border rounded-[14px] p-4">
      <p className="font-serif text-[14px] font-semibold text-ink-dark leading-snug">
        {session.title}
      </p>
      <p className="font-sans text-ink-light text-xs mt-1">
        Fulfilled {formatDate(session.fulfillment_date)}
      </p>
    </div>
  );
}
