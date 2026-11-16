import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-x-5 gap-y-4', className)}>{children}</div>
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-[12.5px] font-medium text-slate-800">{value ?? '—'}</p>
    </div>
  )
}
