import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { useDashboard } from '@/lib/dashboard'
import { api, ApiError } from '@/lib/api'
import type { LeaveBalance, LeaveRequest, LeaveType } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextInput, TextAreaInput, Label, HelpText } from '@/components/ui/Field'
import { SegmentedOption } from '@/components/ui/Pills'
import { LeaveStatusBadge, leaveTypeLabel } from '@/components/ui/Badge'
import { formatDate, formatDateRange } from '@/lib/format'

const LEAVE_TYPES: LeaveType[] = ['CASUAL', 'SICK', 'EARNED']
const REASON_MAX = 500

function workingDays(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0
  let count = 0
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
  }
  return Math.max(count, 1)
}

export function EmployeeLeaveView() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { refresh: refreshDashboard } = useDashboard()

  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function loadData() {
    setLoading(true)
    Promise.all([
      api.get<LeaveBalance[]>('/leaves/balances'),
      api.get<LeaveRequest[]>('/leaves?scope=mine'),
    ])
      .then(([b, r]) => {
        setBalances(b)
        setRequests(r)
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const days = useMemo(() => (startDate && endDate ? workingDays(startDate, endDate) : 0), [startDate, endDate])
  const combinedTotal = balances.reduce((s, b) => s + b.totalDays, 0)
  const combinedRemaining = balances.reduce((s, b) => s + b.remainingDays, 0)
  const remainingAfter = Math.max(combinedRemaining - days, 0)

  async function handleSubmit() {
    setError(null)
    if (!startDate || !endDate) {
      setError('Choose a start and end date.')
      return
    }
    if (endDate < startDate) {
      setError('End date must be on or after the start date.')
      return
    }
    if (!reason.trim()) {
      setError('Let your manager know why you need this time off.')
      return
    }
    if (reason.length > REASON_MAX) {
      setError(`Reason must be ${REASON_MAX} characters or fewer.`)
      return
    }

    setSubmitting(true)
    try {
      await api.post('/leaves', { leaveType, startDate, endDate, reason: reason.trim() })
      showToast('success', 'Request submitted', `Sent to ${user?.fullName ? 'your manager' : ''} for approval.`)
      setStartDate('')
      setEndDate('')
      setReason('')
      loadData()
      refreshDashboard()
    } catch (err) {
      showToast('error', 'Could not submit request', err instanceof ApiError ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-[1fr_1.3fr] items-start gap-4">
      <Card>
        <CardHeader title="Apply for leave" subtitle={user?.managerName ? `Goes to ${user.managerName} for approval` : undefined} />
        <div className="space-y-4 p-[18px]">
          <div>
            <Label>Leave type</Label>
            <div className="flex gap-2">
              {LEAVE_TYPES.map((t) => (
                <SegmentedOption key={t} active={leaveType === t} onClick={() => setLeaveType(t)}>
                  {leaveTypeLabel[t].replace(' Leave', '')}
                </SegmentedOption>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label>Start date</Label>
              <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
            </div>
          </div>

          {days > 0 && (
            <div className="flex items-center gap-2.5 rounded-md border border-blue-100 bg-blue-50 px-3.5 py-2.5">
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-blue-600" />
              <p className="text-[12px] text-blue-900">
                {days} working day{days === 1 ? '' : 's'} · {remainingAfter} of {combinedTotal} days remaining after
                approval
              </p>
            </div>
          )}

          <div>
            <Label>Reason</Label>
            <TextAreaInput
              rows={4}
              maxLength={REASON_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let your manager know why you're requesting this time off…"
            />
            <HelpText>Visible to your manager and HR.</HelpText>
          </div>

          {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}

          <div className="flex gap-2.5">
            <Button className="h-[42px] flex-1" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
            <Button variant="secondary" className="h-[42px]" disabled={submitting}>
              Save draft
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {LEAVE_TYPES.map((t) => {
            const b = balances.find((x) => x.leaveType === t)
            return (
              <div key={t} className="px-4 py-3.5">
                <p className="text-[11px] font-semibold tracking-[.04em] text-slate-500 uppercase">{leaveTypeLabel[t]}</p>
                <p className="mt-1 text-[22px] font-semibold text-slate-900">
                  {b?.remainingDays ?? 0}
                  <span className="text-[12px] font-medium text-slate-400"> / {b?.totalDays ?? 0}</span>
                </p>
              </div>
            )
          })}
        </div>

        <Card>
          <CardHeader title="My leave requests" />
          <div className="grid grid-cols-[1.4fr_1.6fr_.8fr_1fr] gap-3 bg-slate-50 px-[18px] py-[11px] border-b border-slate-200">
            {['Type', 'Dates', 'Days', 'Status'].map((h) => (
              <span key={h} className="text-[10.5px] font-semibold tracking-[.07em] text-slate-500 uppercase">
                {h}
              </span>
            ))}
          </div>
          {!loading && requests.length === 0 && (
            <p className="px-[18px] py-8 text-center text-[12.5px] text-slate-400">No leave requests yet.</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="grid grid-cols-[1.4fr_1.6fr_.8fr_1fr] items-center gap-3 border-b border-slate-100 px-[18px] py-3">
              <div>
                <p className="text-[13px] font-medium text-slate-900">{leaveTypeLabel[r.leaveType]}</p>
                <p className="text-[11px] text-slate-400">applied {formatDate(r.createdAt)}</p>
              </div>
              <span className="text-[12.5px] text-slate-600">{formatDateRange(r.startDate, r.endDate)}</span>
              <span className="text-[12.5px] text-slate-600">{r.days}</span>
              <LeaveStatusBadge status={r.status} className="w-fit" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
