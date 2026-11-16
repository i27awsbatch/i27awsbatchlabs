import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export interface DialogState {
  kind: 'approve' | 'reject'
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
}

export function ConfirmDialog({ dialog, onClose }: { dialog: DialogState | null; onClose: () => void }) {
  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog, onClose])

  if (!dialog) return null

  const isApprove = dialog.kind === 'approve'

  return createPortal(
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(15,23,42,0.42)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] animate-[dialogIn_0.16s_ease-out] rounded-lg bg-white p-6 shadow-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="grid h-10 w-10 place-items-center rounded-md"
          style={{ background: isApprove ? '#EFF6FF' : '#FEE2E2' }}
        >
          {isApprove ? (
            <CheckCircle2 className="h-5 w-5 text-blue-600" strokeWidth={1.7} />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={1.7} />
          )}
        </div>
        <h2 className="mt-3.5 text-[16.5px] font-semibold text-slate-900">{dialog.title}</h2>
        <p className="mt-1.5 text-[13px] leading-[1.6] text-slate-500">{dialog.body}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'primary' : 'danger'}
            size="sm"
            onClick={() => {
              dialog.onConfirm()
              onClose()
            }}
          >
            {dialog.confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
