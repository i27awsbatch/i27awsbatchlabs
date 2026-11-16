import { usePageHeader } from '@/lib/page-header'
import { useAuth } from '@/lib/auth'
import { EmployeeLeaveView } from './leave/EmployeeLeaveView'
import { ApproverLeaveView } from './leave/ApproverLeaveView'

export function LeavePage() {
  const { user } = useAuth()
  const isEmployee = user?.role === 'EMPLOYEE'
  usePageHeader(
    isEmployee ? 'Leave' : 'Leave Management',
    isEmployee ? 'Apply and track your requests' : '',
  )

  if (!user) return null
  if (isEmployee) return <EmployeeLeaveView />
  return <ApproverLeaveView scope={user.role === 'HR_ADMIN' ? 'all' : 'team'} />
}
