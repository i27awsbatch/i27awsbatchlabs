import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-slate-600">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'grid h-4 w-4 place-items-center rounded-[4px] border transition-colors',
          checked ? 'border-slate-900 bg-slate-900' : 'border-slate-300 bg-white',
        )}
      >
        {checked && <Check className="h-[10px] w-[10px] text-white" strokeWidth={3} />}
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}
