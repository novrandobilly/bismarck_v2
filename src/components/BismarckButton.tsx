import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from './LoadingSpinner'

type Variant = 'primary' | 'dark' | 'outline' | 'outline-amber' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'full'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-crust-gold hover:bg-crust-gold-deep text-ink-dark',
  dark: 'bg-ink-dark hover:bg-ink-medium text-surface-white',
  outline: 'bg-surface-white border border-kraft-border text-ink-dark hover:bg-flour-dust',
  'outline-amber': 'bg-transparent border border-crust-gold text-crust-gold hover:bg-crust-gold-light',
  ghost: 'bg-transparent text-ink-medium underline hover:text-ink-dark',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-[12px]',
  lg: 'px-6 py-3 text-base rounded-[14px]',
  full: 'w-full px-4 py-2.5 text-sm rounded-[14px]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

export function BismarckButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'font-sans font-semibold transition-colors cursor-pointer disabled:opacity-60',
        isLoading && 'flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  )
}
