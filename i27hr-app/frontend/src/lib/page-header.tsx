import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface PageHeaderValue {
  title: string
  crumb: string
  setHeader: (title: string, crumb: string) => void
}

const PageHeaderContext = createContext<PageHeaderValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('i27CoreHR')
  const [crumb, setCrumb] = useState('')

  const setHeader = (t: string, c: string) => {
    setTitle(t)
    setCrumb(c)
  }

  const value = useMemo(() => ({ title, crumb, setHeader }), [title, crumb])

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

export function usePageHeaderValue() {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) throw new Error('usePageHeaderValue must be used within PageHeaderProvider')
  return ctx
}

export function usePageHeader(title: string, crumb: string) {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) throw new Error('usePageHeader must be used within PageHeaderProvider')
  const { setHeader } = ctx
  useEffect(() => {
    setHeader(title, crumb)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, crumb])
}
