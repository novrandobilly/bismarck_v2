import type { Session } from '@/types/session'

interface Props {
  session: Session
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDeadline(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ID', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function SessionHeader({ session }: Props) {
  return (
    <div className="mb-8">
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-2">
        Pre-Order Session
      </p>
      <h1 className="font-serif text-2xl font-bold text-ink-dark mb-1 leading-snug">
        {session.title}
      </h1>
      {session.description && (
        <p className="font-sans text-ink-medium text-sm mb-4 leading-relaxed">
          {session.description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <div className="inline-flex items-center gap-2 bg-session-open-bg border border-session-open-dot/20 rounded-lg px-3 py-2 text-sm font-sans">
          <span className="text-session-open-text font-medium">
            Ready {formatDate(session.fulfillment_date)}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 bg-flour-dust border border-kraft-border rounded-lg px-3 py-2 text-sm font-sans">
          <span className="text-ink-medium">
            Order by {formatDeadline(session.order_deadline)}
          </span>
        </div>
      </div>
    </div>
  )
}
