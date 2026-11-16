import { useState } from 'react'
import { useDashboard } from '@/lib/dashboard'
import { useToast } from '@/lib/toast'
import { api, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LeaveTypeBadge } from '@/components/ui/Badge'
import { ConfirmDialog, type DialogState } from '@/components/ui/ConfirmDialog'
import { ActivityFeed } from '@/components/ActivityFeed'
import { formatDateRange } from '@/lib/format'
import { leaveTypeLabel } from '@/components/ui/Badge'

export function ManagerDashboard() {
  const { data, loading, refresh } = useDashboard()
  const { showToast } = useToast()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const stats = data?.stats
  const pending = data?.pendingApprovals ?? []

  async function review(id: number, action: 'approve' | 'reject') {
    setBusyId(id)
    try {
      await api.patch(`/leaves/${id}/${action}`, {})
      showToast(
        action === 'approve' ? 'success' : 'info',
        action === 'approve' ? 'Request approved' : 'Request rejected',
        action === 'approve' ? 'The employee has been notified.' : 'The employee has been notified.',
      )
      refresh()
    } catch (err) {
      showToast('error', 'Could not update request', err instanceof ApiError ? err.message : undefined)
    } finally {
      setBusyId(null)
    }
  }

  function confirmApprove(id: number, name: string) {
    setDialog({
      kind: 'approve',
      title: 'Approve this leave request?',
      body: `${name} will be notified that their request has been approved.`,
      confirmLabel: 'Approve',
      onConfirm: () => review(id, 'approve'),
    })
  }

  function confirmReject(id: number, name: string) {
    setDialog({
      kind: 'reject',
      title: 'Reject this leave request?',
      body: `${name} will be notified that their request has been rejected.`,
      confirmLabel: 'Reject',
      onConfirm: () => review(id, 'reject'),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
        <StatCard label="Team size" value={loading ? '—' : (stats?.teamSize ?? 0)} />
        <StatCard label="On leave this week" value={loading ? '—' : (stats?.onLeaveThisWeek ?? 0)} />
        <StatCard label="Pending approvals" value={loading ? '—' : (stats?.pendingApprovals ?? 0)} />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 items-start">
        <Card>
          <CardHeader
            title="Pending approvals"
            subtitle="Requests waiting on you"
            right={
              pending.length > 0 ? (
                <span className="mr-auto ml-3 inline-grid h-[22px] shrink-0 place-items-center rounded-[7px] bg-amber-100 px-2.5 text-[11px] font-semibold text-amber-700">
                  {pending.length} pending
                </span>
              ) : undefined
            }
          />
          <div>
            {pending.length === 0 && (
              <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">No pending approvals.</p>
            )}
            {pending.map((r) => (
              <div key={r.id} className="border-b border-slate-100 px-[18px] py-3.5 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Avatar id={r.employeeId} name={r.employeeName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{r.employeeName}</p>
                    <p className="truncate text-[11.5px] text-slate-500">
                      {leaveTypeLabel[r.leaveType]} · {formatDateRange(r.startDate, r.endDate)} · {r.days} day
                      {r.days === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="xs"
                    className="h-8"
                    disabled={busyId === r.id}
                    onClick={() => confirmReject(r.id, r.employeeName)}
                  >
                    Reject
                  </Button>
                  <Button size="xs" className="h-8" disabled={busyId === r.id} onClick={() => confirmApprove(r.id, r.employeeName)}>
                    Approve
                  </Button>
                </div>
                {r.reason && (
                  <div className="ml-[46px] mt-2.5 rounded-lg border border-slate-100 bg-slate-50 px-[11px] py-2.5 text-[11.5px] text-slate-600">
                    "{r.reason}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Out of office this week" />
            <div>
              {(data?.outOfOffice ?? []).length === 0 && (
                <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">Nobody is out this week.</p>
              )}
              {(data?.outOfOffice ?? []).map((r) => (
                <div key={r.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                  <Avatar id={r.employeeId} name={r.employeeName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{r.employeeName}</p>
                    <p className="truncate text-[11.5px] text-slate-500">{formatDateRange(r.startDate, r.endDate)}</p>
                  </div>
                  <LeaveTypeBadge type={r.leaveType} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent team leave activity" />
            <ActivityFeed items={data?.activity ?? []} />
          </Card>
        </div>
      </div>

      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  )
}
