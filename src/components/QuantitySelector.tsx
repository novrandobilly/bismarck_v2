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
        className="w-9 h-9 rounded-full border border-kraft-border flex items-center justify-center text-ink-dark disabled:opacity-40 hover:bg-flour-dust transition-colors text-base leading-none"
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
        className="w-9 text-center text-sm font-medium font-sans tabular-nums bg-transparent border-b border-transparent focus:border-crust-gold focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => { if (max === undefined || value < max) onChange(value + 1) }}
        disabled={max !== undefined && value >= max}
        className="w-9 h-9 rounded-full border border-kraft-border flex items-center justify-center text-ink-dark disabled:opacity-40 hover:bg-flour-dust transition-colors text-base leading-none"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

