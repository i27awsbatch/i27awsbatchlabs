import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  kind: ToastKind
  title: string
  body?: string
}

interface ToastContextValue {
  toast: ToastData | null
  showToast: (kind: ToastKind, title: string, body?: string) => void
  dismissToast: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(0)

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback((kind: ToastKind, title: string, body?: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    idRef.current += 1
    setToast({ id: idRef.current, kind, title, body })
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const value = useMemo(() => ({ toast, showToast, dismissToast }), [toast, showToast, dismissToast])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
