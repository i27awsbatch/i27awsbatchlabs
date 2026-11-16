import { X } from 'lucide-react'
import { useToast, type ToastKind } from '@/lib/toast'

const kindColor: Record<ToastKind, string> = {
  success: '#16A34A',
  error: '#DC2626',
  info: '#2563EB',
}

export function ToastViewport() {
  const { toast, dismissToast } = useToast()
  if (!toast) return null

  const color = kindColor[toast.kind]

  return (
    <div
      key={toast.id}
      className="fixed right-6 top-5 z-[80] min-w-[308px] max-w-[380px] animate-[toastIn_0.18s_ease-out] rounded-lg border border-slate-200 bg-white p-[13px_14px] shadow-toast"
      style={{ borderLeft: `3px solid ${color}` }}
      role="status"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-slate-900">{toast.title}</p>
          {toast.body && <p className="mt-0.5 text-[11.5px] text-slate-500">{toast.body}</p>}
        </div>
        <button
          type="button"
          onClick={dismissToast}
          className="shrink-0 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss notification"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}
