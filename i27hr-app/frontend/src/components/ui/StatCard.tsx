import { cn } from '@/lib/cn'

export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
}: {
  label: string
  value: string | number
  delta?: string
  deltaTone?: 'positive' | 'warning' | 'neutral'
}) {
  return (
    <div className="bg-white px-[18px] py-4">
      <span className="text-[11px] font-semibold tracking-[.04em] text-slate-500 uppercase">{label}</span>
      <div className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-slate-900">{value}</div>
      {delta && (
        <div
          className={cn(
            'mt-1 text-[11.5px] font-medium',
            deltaTone === 'positive' && 'text-green-700',
            deltaTone === 'warning' && 'text-amber-700',
            deltaTone === 'neutral' && 'text-slate-400',
          )}
        >
          {delta}
        </div>
      )}
    </div>
  )
}
