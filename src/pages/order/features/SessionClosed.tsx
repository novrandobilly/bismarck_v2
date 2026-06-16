export function SessionClosed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4">
      <div className="text-center">
        <p className="font-serif text-2xl font-bold text-ink-dark mb-2">Pre-Order Closed</p>
        <p className="font-sans text-ink-medium text-sm">This pre-order session is no longer accepting orders.</p>
      </div>
    </div>
  )
}
