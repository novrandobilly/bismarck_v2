import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PastSessionCard } from "./features/PastSessionCard";
import type { Session } from "@/types/session";

interface PastPreOrdersProps {
  isLoading: boolean;
  closedSessions: Session[];
}

export function PastPreOrders({
  isLoading,
  closedSessions,
}: PastPreOrdersProps) {
  if (!isLoading && closedSessions.length === 0) return null;

  return (
    <section>
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-4">
        Past Pre-Orders
      </p>

      {isLoading && <LoadingSpinner centered />}

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {closedSessions.map((s) => (
            <PastSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </section>
  );
}
