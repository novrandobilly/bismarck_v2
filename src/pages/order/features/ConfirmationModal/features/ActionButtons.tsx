import { useConfirmationModalContext } from '../ConfirmationModalContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function ActionButtons() {
  const { isPending, error, handleConfirm, onCancel } = useConfirmationModalContext()
  
  return (
    <div className="space-y-2 mt-auto">
      {error && (
        <p className="font-sans text-red-600 text-xs text-center mb-3">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="w-full bg-crust-gold hover:bg-crust-gold-deep disabled:opacity-60 text-ink-dark font-sans font-semibold rounded-xl py-3.5 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {isPending ? <LoadingSpinner size="sm" /> : 'Confirm & Pay'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="w-full text-ink-light hover:text-ink-dark text-xs py-2 transition-colors font-sans font-medium cursor-pointer"
      >
        Cancel
      </button>
    </div>
  )
}
