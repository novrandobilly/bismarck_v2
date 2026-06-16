import { useState, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useUploadProof } from './hooks/useUploadProof'

const MAX_FILE_SIZE_MB = 5

export default function UploadProofPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate, isPending, error, reset } = useUploadProof()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError(null)
    if (selected && selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim() || !file) return
    reset()
    mutate(
      { orderId: orderId.trim(), file },
      { onSuccess: () => setSuccess(true) }
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-session-open-bg border border-session-open-dot/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-session-open-text text-xl font-bold">✓</span>
          </div>
          <h1 className="font-serif text-xl font-bold text-ink-dark mb-2">Proof submitted!</h1>
          <p className="font-sans text-ink-medium text-sm mb-6 leading-relaxed">
            We'll verify your payment and update your order status shortly.
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer block w-full bg-ink-dark hover:bg-ink-medium text-surface-white text-center font-sans font-semibold text-sm py-3 rounded-[14px] transition-colors"
            >
              Back to Order Details
            </button>
            <Link
              to="/"
              className="block border border-kraft-border hover:bg-flour-dust text-ink-medium hover:text-ink-dark text-center font-sans font-semibold text-sm py-3 rounded-[14px] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <div className="max-w-md mx-auto px-4 py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold font-sans text-ink-medium hover:text-ink-dark transition-colors mb-6"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-bold text-ink-dark mb-1">Upload Payment Proof</h1>
        <p className="font-sans text-ink-medium text-sm mb-6 leading-relaxed">
          Send us a screenshot of your transfer or QRIS payment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order ID */}
          <div>
            <label className="block font-sans text-sm font-medium text-ink-dark mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste your order ID here"
              required
              className="w-full border border-kraft-border rounded-xl px-4 py-2.5 text-sm font-sans text-ink-dark bg-surface-white focus:outline-none focus:ring-2 focus:ring-crust-gold/40 transition-shadow"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block font-sans text-sm font-medium text-ink-dark mb-1">
              Proof Image
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
              className="cursor-pointer border-2 border-dashed border-kraft-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-crust-gold transition-colors focus:outline-none focus:ring-2 focus:ring-crust-gold/40"
            >
              {file ? (
                <>
                  <p className="font-sans text-sm font-medium text-ink-dark">{file.name}</p>
                  <p className="font-sans text-xs text-ink-light">
                    {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl">📎</p>
                  <p className="font-sans text-sm text-ink-medium">Click to select image</p>
                  <p className="font-sans text-xs text-ink-light">JPEG, PNG, WEBP · max 5 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileError && (
              <p className="font-sans text-xs text-red-600 mt-1">{fileError}</p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {(error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !orderId.trim() || !file}
            className="cursor-pointer w-full bg-crust-gold hover:bg-crust-gold-deep disabled:opacity-50 text-ink-dark font-sans font-semibold text-sm py-3.5 rounded-[14px] transition-colors"
          >
            {isPending ? 'Uploading…' : 'Submit Proof'}
          </button>
        </form>
      </div>
    </div>
  )
}
