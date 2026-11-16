import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'destructive' | 'danger' | 'ghost'
type Size = 'md' | 'sm' | 'xs'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  destructive:
    'bg-white border border-slate-300 text-slate-700 hover:border-red-600 hover:text-red-600 hover:bg-red-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-4 text-[13px]',
  sm: 'h-9 px-3.5 text-[12.5px]',
  xs: 'h-7 px-2.5 text-[12px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
})
