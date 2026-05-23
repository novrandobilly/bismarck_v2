import { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useUploadProof } from './hooks/useUploadProof'

const MAX_FILE_SIZE_MB = 5

export default function UploadProofPage() {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') ?? '')
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_transfer'>('bank_transfer')
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
      { orderId: orderId.trim(), paymentMethod, file },
      { onSuccess: () => setSuccess(true) }
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">Proof submitted!</h1>
          <p className="text-stone-500 text-sm mb-6">
            We'll verify your payment and update your order status shortly.
          </p>
          <Link
            to="/"
            className="block bg-stone-900 hover:bg-stone-800 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Upload Payment Proof</h1>
        <p className="text-stone-500 text-sm mb-6">
          Send us a screenshot of your transfer or QRIS payment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order ID */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste your order ID here"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Payment Method
            </label>
            <div className="flex gap-2">
              {(['bank_transfer', 'qris'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
                    paymentMethod === method
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {method === 'bank_transfer' ? 'Bank Transfer' : 'QRIS'}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Proof Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-amber-400 transition-colors"
            >
              {file ? (
                <>
                  <p className="text-sm font-medium text-stone-700">{file.name}</p>
                  <p className="text-xs text-stone-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl">📎</p>
                  <p className="text-sm text-stone-500">Click to select image</p>
                  <p className="text-xs text-stone-400">JPEG, PNG, WEBP · max 5 MB</p>
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
              <p className="text-xs text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {(error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !orderId.trim() || !file}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {isPending ? 'Uploading…' : 'Submit Proof'}
          </button>
        </form>
      </div>
    </div>
  )
}
