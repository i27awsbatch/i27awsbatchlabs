import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 560,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  maxWidth?: number
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(15,23,42,0.42)] p-4" onClick={onClose}>
      <div
        className={cn(
          'w-full animate-[dialogIn_0.16s_ease-out] rounded-lg bg-white shadow-dialog',
          'max-h-[90vh] overflow-y-auto',
        )}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-[16.5px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-[12.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
