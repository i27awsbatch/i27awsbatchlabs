import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

export type FieldState = 'default' | 'ok' | 'error'

const inputBase =
  'w-full h-10 rounded-md border px-3 text-[13px] text-slate-900 bg-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400'

function stateClasses(state: FieldState) {
  if (state === 'ok') return 'border-green-600 pr-9 focus:border-green-600'
  if (state === 'error') return 'border-red-600 pr-9 focus:border-red-600'
  return 'border-slate-300 focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]'
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-slate-700">
      {children}
    </label>
  )
}

export function HelpText({ state = 'default', children }: { state?: FieldState; children: ReactNode }) {
  return (
    <p
      className={cn(
        'mt-1.5 text-[11px]',
        state === 'ok' && 'text-green-700',
        state === 'error' && 'text-red-600',
        state === 'default' && 'text-slate-400',
      )}
    >
      {children}
    </p>
  )
}

function StateBadge({ state }: { state: FieldState }) {
  if (state === 'ok')
    return (
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 grid h-[18px] w-[18px] place-items-center rounded-full bg-green-600">
        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
      </span>
    )
  if (state === 'error')
    return (
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 grid h-[18px] w-[18px] place-items-center rounded-full bg-red-600">
        <AlertCircle className="h-3 w-3 text-white" strokeWidth={2.5} />
      </span>
    )
  return null
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  state?: FieldState
  wrapperClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, state = 'default', wrapperClassName, ...props },
  ref,
) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <input ref={ref} className={cn(inputBase, stateClasses(state), className)} {...props} />
      <StateBadge state={state} />
    </div>
  )
})

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  state?: FieldState
  wrapperClassName?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className, state = 'default', wrapperClassName, children, ...props },
  ref,
) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <select
        ref={ref}
        className={cn(inputBase, stateClasses(state), 'appearance-none bg-no-repeat pr-8', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
      <StateBadge state={state} />
    </div>
  )
})

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: FieldState
}

export const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextAreaInput(
  { className, state = 'default', rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-md border px-3 py-2.5 text-[13px] leading-[1.55] text-slate-900 bg-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 resize-y',
        stateClasses(state).replace('pr-9', ''),
        className,
      )}
      {...props}
    />
  )
})
