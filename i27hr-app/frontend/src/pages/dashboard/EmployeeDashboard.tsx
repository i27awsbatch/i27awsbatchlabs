import { useNavigate } from 'react-router-dom'
import { Plus, Download } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useDashboard } from '@/lib/dashboard'
import { useToast } from '@/lib/toast'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FieldGrid, FieldRow } from '@/components/ui/FieldGrid'
import { LeaveStatusBadge, leaveTypeLabel } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LeaveBalanceWidget } from '@/components/LeaveBalanceWidget'
import { FileTypeChip } from '@/components/FileTypeChip'
import { formatDate, formatDateRange } from '@/lib/format'
import { triggerDocumentDownload } from '@/lib/download'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function EmployeeDashboard() {
  const { user } = useAuth()
  const { data, loading } = useDashboard()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const balances = data?.leaveBalances ?? []
  const totalRemaining = balances.reduce((sum, b) => sum + b.remainingDays, 0)
  const pendingCount = (data?.myRecentRequests ?? []).filter((r) => r.status === 'PENDING').length
  const employee = data?.employee

  const firstName = user?.fullName.split(' ')[0] ?? ''

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
            {greeting()}, {firstName}
          </h1>
          {!loading && (
            <p className="mt-1 text-[13px] text-slate-500">
              You have {totalRemaining} leave day{totalRemaining === 1 ? '' : 's'} remaining
              {pendingCount > 0 ? ` and ${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting approval.` : '.'}
            </p>
          )}
        </div>
        <Button className="h-10" onClick={() => navigate('/leave')}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Apply for leave
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3.5 border-b border-slate-100 px-[18px] py-4">
              <Avatar id={employee?.id ?? 0} name={employee?.fullName ?? ''} size="lg" />
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{employee?.fullName}</p>
                <p className="text-[12.5px] text-slate-500">{employee?.designation}</p>
              </div>
            </div>
            <div className="px-[18px] py-4">
              <FieldGrid>
                <FieldRow label="Employee ID" value={employee?.employeeCode} />
                <FieldRow label="Department" value={employee?.department} />
                <FieldRow label="Reports to" value={employee?.managerName ?? '—'} />
                <FieldRow label="Location" value={employee?.location} />
                <FieldRow label="Joined" value={employee && formatDate(employee.joiningDate)} />
                <FieldRow label="Status" value={employee?.employmentStatus === 'ACTIVE' ? 'Active' : 'Inactive'} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="My recent requests" />
            {(data?.myRecentRequests ?? []).length === 0 ? (
              <EmptyState
                title="No leave requests yet"
                description="When you apply for leave, your requests and their approval status will show up here."
                actionLabel="Apply for leave"
                onAction={() => navigate('/leave')}
              />
            ) : (
              <div>
                {(data?.myRecentRequests ?? []).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{leaveTypeLabel[r.leaveType]}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {formatDateRange(r.startDate, r.endDate)} · {r.days} day{r.days === 1 ? '' : 's'} · applied{' '}
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <LeaveStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <LeaveBalanceWidget balances={balances} />
          </Card>

          <Card>
            <CardHeader title="Recent documents" />
            <div>
              {(data?.recentDocuments ?? []).length === 0 && (
                <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">No documents yet.</p>
              )}
              {(data?.recentDocuments ?? []).map((d) => (
                <div key={d.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                  <FileTypeChip fileName={d.fileName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{d.fileName}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {d.documentType.replaceAll('_', ' ')} · {formatDate(d.uploadedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerDocumentDownload(d.id, d.fileName)
                      showToast('success', 'Download started', `${d.fileName} is downloading.`)
                    }}
                    className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
