import { cn } from '@/lib/cn'

export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 rounded-md px-3 text-[12px] font-semibold transition-colors',
        active
          ? 'border border-slate-300 bg-slate-100 text-slate-900'
          : 'border border-slate-200 text-slate-500 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

export function SegmentedOption({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-[38px] flex-1 rounded-md border text-[12.5px] font-semibold transition-colors',
        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}
