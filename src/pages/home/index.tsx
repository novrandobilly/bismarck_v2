import { Link } from "react-router-dom";
import {
  usePublicSessions,
  getOpenSession,
  getClosedSessions,
} from "./hooks/usePublicSessions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Session } from "@/types/session";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OpenPOBanner({ session }: { session: Session }) {
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

function PastSessionCard({ session }: { session: Session }) {
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

const BAGEL_FACTS = [
  {
    icon: "🌾",
    title: "Long Fermentation",
    body: "Our dough ferments slowly for 18–24 hours in the cold, developing deep, complex flavour that you simply cannot rush.",
  },
  {
    icon: "💧",
    title: "Wild Yeast Starter",
    body: "Powered entirely by a live sourdough starter — no commercial yeast. Each batch carries the character of living culture.",
  },
  {
    icon: "🫧",
    title: "Boiled Before Baked",
    body: "Every bagel is hand-shaped and kettle-boiled in a honey-water bath before hitting the oven. That's what gives you the iconic chewy crust.",
  },
  {
    icon: "✋",
    title: "Made to Order",
    body: "We bake in small batches per pre-order session — so every bagel you get is freshly made, never sitting on a shelf.",
  },
];

export default function HomePage() {
  const { data: sessions = [], isLoading } = usePublicSessions();
  const openSession = getOpenSession(sessions);
  const closedSessions = getClosedSessions(sessions);

  return (
    <>
      {/* Brand stamp — compact identity before the pre-order card */}
      <header className="bg-warm-cream border-b border-kraft-border-soft">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink-dark leading-none tracking-tight">
            Envien Bagel
          </h1>
          <p className="font-sans text-[11px] font-medium text-ink-medium mt-1.5 tracking-[0.08em]">
            Homemade · Small Batch · Sourdough
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-10 space-y-12">
        {/* Open PO Section */}
        <section>
          <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-4">
            Current Pre-Order
          </p>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner centered />
            </div>
          ) : openSession ? (
            <OpenPOBanner session={openSession} />
          ) : (
            <div className="bg-surface-white border border-kraft-border rounded-2xl p-6 text-center">
              <p className="font-serif text-lg font-semibold text-ink-dark mb-1">
                No open pre-order right now
              </p>
              <p className="font-sans text-ink-medium text-sm leading-relaxed">
                We bake in small batches and open sessions periodically. Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* Past Sessions Section */}
        {(isLoading || closedSessions.length > 0) && (
          <section>
            <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-4">
              Past Pre-Orders
            </p>
            {isLoading ? (
              <LoadingSpinner centered />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {closedSessions.map((s) => (
                  <PastSessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* What Makes It Special */}
        <section>
          <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-6">
            What Makes It Special
          </p>
          <div className="space-y-6">
            {BAGEL_FACTS.map((fact) => (
              <div key={fact.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-flour-dust border border-kraft-border-soft flex items-center justify-center text-lg shrink-0">
                  {fact.icon}
                </div>
                <div>
                  <p className="font-serif text-[15px] font-semibold text-ink-dark leading-snug">
                    {fact.title}
                  </p>
                  <p className="font-sans text-ink-medium text-[14px] mt-1 leading-relaxed max-w-[55ch]">
                    {fact.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
