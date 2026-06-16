import { LoadingSpinner } from '@/components/LoadingSpinner'

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream">
      <LoadingSpinner centered />
    </div>
  )
}
