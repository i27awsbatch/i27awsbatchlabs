import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-slate-200 bg-white', className)}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  linkLabel,
  linkTo,
  right,
}: {
  title: ReactNode
  subtitle?: ReactNode
  linkLabel?: string
  linkTo?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-[18px] py-4">
      <div>
        <h2 className="text-[13.5px] font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-400">{subtitle}</p>}
      </div>
      {right}
      {linkLabel && linkTo && (
        <Link to={linkTo} className="shrink-0 text-[12px] font-medium text-blue-600 hover:text-blue-700">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
