import { useEffect, useState } from 'react'
import { useToast } from '@/lib/toast'
import { useDashboard } from '@/lib/dashboard'
import { api, ApiError } from '@/lib/api'
import type { LeaveRequest, LeaveStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FilterPill } from '@/components/ui/Pills'
import { LeaveStatusBadge, leaveTypeLabel } from '@/components/ui/Badge'
import { TextAreaInput } from '@/components/ui/Field'
import { ConfirmDialog, type DialogState } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/cn'
import { formatDate, formatDateRange } from '@/lib/format'

const STATUS_FILTERS: { label: string; value: LeaveStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All', value: 'ALL' },
]

export function ApproverLeaveView({ scope }: { scope: 'team' | 'all' }) {
  const { showToast } = useToast()
  const { refresh: refreshDashboard } = useDashboard()

  const [status, setStatus] = useState<LeaveStatus | 'ALL'>('PENDING')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [busy, setBusy] = useState(false)

  function loadData() {
    setLoading(true)
    const params = new URLSearchParams({ scope })
    if (status !== 'ALL') params.set('status', status)
    api
      .get<LeaveRequest[]>(`/leaves?${params.toString()}`)
      .then((r) => {
        setRequests(r)
        setSelectedId((current) => (r.some((x) => x.id === current) ? current : (r[0]?.id ?? null)))
      })
      .catch(() => showToast('error', 'Could not load requests'))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [status, scope])

  const selected = requests.find((r) => r.id === selectedId) ?? null

  useEffect(() => {
    setComment('')
  }, [selectedId])

  async function review(action: 'approve' | 'reject') {
    if (!selected) return
    setBusy(true)
    try {
      await api.patch(`/leaves/${selected.id}/${action}`, comment.trim() ? { comment: comment.trim() } : {})
      showToast(
        action === 'approve' ? 'success' : 'info',
        action === 'approve' ? 'Request approved' : 'Request rejected',
        `${selected.employeeName} has been notified.`,
      )
      loadData()
      refreshDashboard()
    } catch (err) {
      showToast('error', 'Could not update request', err instanceof ApiError ? err.message : undefined)
    } finally {
      setBusy(false)
    }
  }

  function confirmApprove() {
    if (!selected) return
    setDialog({
      kind: 'approve',
      title: 'Approve this leave request?',
      body: `${selected.employeeName} will be notified that their ${leaveTypeLabel[selected.leaveType].toLowerCase()} request has been approved.`,
      confirmLabel: 'Approve',
      onConfirm: () => review('approve'),
    })
  }

  function confirmReject() {
    if (!selected) return
    setDialog({
      kind: 'reject',
      title: 'Reject this leave request?',
      body: `${selected.employeeName} will be notified that their ${leaveTypeLabel[selected.leaveType].toLowerCase()} request has been rejected.`,
      confirmLabel: 'Reject',
      onConfirm: () => review('reject'),
    })
  }

  return (
    <div className="grid grid-cols-[1.35fr_1fr] items-start gap-4">
      <Card>
        <div className="flex items-center gap-2 border-b border-slate-200 px-[18px] py-3.5">
          {STATUS_FILTERS.map((f) => (
            <FilterPill key={f.value} active={status === f.value} onClick={() => setStatus(f.value)}>
              {f.label}
            </FilterPill>
          ))}
        </div>
        <div className="grid grid-cols-[1.8fr_1.2fr_1.5fr_1fr] gap-3 bg-slate-50 px-[18px] py-[11px] border-b border-slate-200">
          {['Employee', 'Type', 'Dates', 'Status'].map((h) => (
            <span key={h} className="text-[10.5px] font-semibold tracking-[.07em] text-slate-500 uppercase">
              {h}
            </span>
          ))}
        </div>
        {!loading && requests.length === 0 && (
          <p className="px-[18px] py-10 text-center text-[12.5px] text-slate-400">No requests here.</p>
        )}
        {requests.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedId(r.id)}
            className={cn(
              'grid w-full grid-cols-[1.8fr_1.2fr_1.5fr_1fr] items-center gap-3 border-b border-slate-100 px-[18px] py-3 text-left transition-colors',
              selectedId === r.id ? 'bg-slate-50 shadow-[inset_3px_0_0_#0F172A]' : 'hover:bg-slate-50/60',
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar id={r.employeeId} name={r.employeeName} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-900">{r.employeeName}</p>
                <p className="truncate text-[11px] text-slate-400">{r.employeeDepartment}</p>
              </div>
            </div>
            <span className="text-[12.5px] text-slate-600">{leaveTypeLabel[r.leaveType].replace(' Leave', '')}</span>
            <span className="text-[12.5px] text-slate-600">{formatDateRange(r.startDate, r.endDate)}</span>
            <LeaveStatusBadge status={r.status} className="w-fit" />
          </button>
        ))}
      </Card>

      <div className="sticky top-[88px]">
        {!selected ? (
          <Card className="p-10 text-center text-[12.5px] text-slate-400">Select a request to see details.</Card>
        ) : (
          <Card>
            <div className="flex items-center justify-between border-b border-slate-200 px-[18px] py-4">
              <h2 className="text-[13.5px] font-semibold text-slate-900">Request details</h2>
              <LeaveStatusBadge status={selected.status} />
            </div>
            <div className="px-[18px] py-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Avatar id={selected.employeeId} name={selected.employeeName} size="md" />
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">{selected.employeeName}</p>
                  <p className="text-[11.5px] text-slate-500">
                    {selected.employeeDesignation} · {selected.employeeDepartment}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 border-b border-slate-100 py-4">
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">Leave type</p>
                  <p className="mt-1 text-[12.5px] font-medium text-slate-800">{leaveTypeLabel[selected.leaveType]}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">Duration</p>
                  <p className="mt-1 text-[12.5px] font-medium text-slate-800">
                    {selected.days} day{selected.days === 1 ? '' : 's'}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">Dates</p>
                  <p className="mt-1 text-[12.5px] font-medium text-slate-800">
                    {formatDateRange(selected.startDate, selected.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">Applied on</p>
                  <p className="mt-1 text-[12.5px] font-medium text-slate-800">{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="py-4">
                <p className="text-[10.5px] font-semibold tracking-[.06em] text-slate-400 uppercase">Reason</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.6] text-slate-700">{selected.reason}</p>
              </div>

              {selected.status !== 'PENDING' ? (
                selected.reviewerComment && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-slate-500">
                      {selected.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {selected.reviewedBy}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-700">{selected.reviewerComment}</p>
                  </div>
                )
              ) : (
                <>
                  <TextAreaInput
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for the employee…"
                  />
                  <div className="mt-4 flex gap-2.5">
                    <Button variant="destructive" className="h-10 flex-1" disabled={busy} onClick={confirmReject}>
                      Reject
                    </Button>
                    <Button className="h-10 flex-1" disabled={busy} onClick={confirmApprove}>
                      Approve
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  )
}
