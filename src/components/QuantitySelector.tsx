import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({ value, onChange, min = 0, max, className }: Props) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')

  function handleFocus() {
    setEditing(true)
    setInputVal(value === 0 ? '' : String(value))
  }

  function commit(raw: string) {
    setEditing(false)
    const parsed = parseInt(raw, 10)
    if (isNaN(parsed) || parsed < 0) { onChange(min); return }
    const clamped = max !== undefined ? Math.min(parsed, max) : parsed
    onChange(Math.max(clamped, min))
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => { if (value > min) onChange(value - 1) }}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={editing ? inputVal : value}
        onFocus={handleFocus}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        className="w-8 text-center text-sm font-medium tabular-nums bg-transparent border-b border-transparent focus:border-amber-400 focus:outline-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => { if (max === undefined || value < max) onChange(value + 1) }}
        disabled={max !== undefined && value >= max}
        className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

