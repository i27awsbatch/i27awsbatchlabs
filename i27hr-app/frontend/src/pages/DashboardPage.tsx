import { usePageHeader } from '@/lib/page-header'
import { useAuth } from '@/lib/auth'
import { HrDashboard } from './dashboard/HrDashboard'
import { ManagerDashboard } from './dashboard/ManagerDashboard'
import { EmployeeDashboard } from './dashboard/EmployeeDashboard'

const TODAY_LABEL = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function DashboardPage() {
  const { user } = useAuth()
  const title =
    user?.role === 'HR_ADMIN' ? 'HR Dashboard' : user?.role === 'MANAGER' ? 'Team Dashboard' : 'My Dashboard'
  usePageHeader(title, TODAY_LABEL)

  if (!user) return null
  if (user.role === 'HR_ADMIN') return <HrDashboard />
  if (user.role === 'MANAGER') return <ManagerDashboard />
  return <EmployeeDashboard />
}
