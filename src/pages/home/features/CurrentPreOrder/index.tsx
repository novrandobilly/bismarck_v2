import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OpenPOBanner } from "./features/OpenPOBanner";
import type { Session } from "@/types/session";

interface CurrentPreOrderProps {
  isLoading: boolean;
  openSession: Session | undefined;
}

export function CurrentPreOrder({
  isLoading,
  openSession,
}: CurrentPreOrderProps) {
  return (
    <section>
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-4">
        Current Pre-Order
      </p>

      {isLoading && (
        <div className="h-32 flex items-center justify-center">
          <LoadingSpinner centered />
        </div>
      )}

      {!isLoading && openSession && <OpenPOBanner session={openSession} />}

      {!isLoading && !openSession && (
        <div className="bg-surface-white border border-kraft-border rounded-2xl p-6 text-center">
          <p className="font-serif text-lg font-semibold text-ink-dark mb-1">
            No open pre-order right now
          </p>
          <p className="font-sans text-ink-medium text-sm leading-relaxed">
            We bake in small batches and open sessions periodically. Check back
            soon.
          </p>
        </div>
      )}
    </section>
  );
}
