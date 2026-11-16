import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import type { ActivityItem, DashboardStats, Employee, EmployeeDocument, LeaveBalance, LeaveRequest } from '@/types'

export interface DashboardResponse {
  stats: DashboardStats
  recentLeaveRequests?: LeaveRequest[]
  pendingApprovals?: LeaveRequest[]
  recentlyAdded?: Employee[]
  activity?: ActivityItem[]
  outOfOffice?: LeaveRequest[]
  employee?: Employee
  leaveBalances?: LeaveBalance[]
  myRecentRequests?: LeaveRequest[]
  recentDocuments?: EmployeeDocument[]
}

interface DashboardContextValue {
  data: DashboardResponse | null
  loading: boolean
  pendingLeaveCount: number
  refresh: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    api
      .get<DashboardResponse>('/dashboard')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [user, tick])

  const pendingLeaveCount =
    data?.stats.pendingRequests ?? data?.stats.pendingApprovals ?? data?.pendingApprovals?.length ?? 0

  const value = useMemo(
    () => ({ data, loading, pendingLeaveCount, refresh }),
    [data, loading, pendingLeaveCount, refresh],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
