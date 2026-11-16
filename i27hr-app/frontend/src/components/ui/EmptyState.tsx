import type { ReactNode } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-5 py-11 text-center">
      <div className="mb-3 grid h-[46px] w-[46px] place-items-center rounded-full bg-slate-100">
        {icon ?? <CalendarDays className="h-5 w-5 text-slate-400" strokeWidth={1.6} />}
      </div>
      <h3 className="text-[13.5px] font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-[280px] text-[12px] leading-[1.55] text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4 h-[34px]" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
