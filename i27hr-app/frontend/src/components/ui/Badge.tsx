import { cn } from '@/lib/cn'
import type { EmploymentStatus, LeaveStatus, LeaveType } from '@/types'

type Tone = 'green' | 'amber' | 'red' | 'slate' | 'blue'

const toneClasses: Record<Tone, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-500',
  blue: 'bg-blue-50 text-blue-700',
}

export function Badge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-grid h-[22px] shrink-0 place-items-center rounded-[7px] px-2.5 text-[11px] font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const leaveStatusTone: Record<LeaveStatus, Tone> = {
  APPROVED: 'green',
  PENDING: 'amber',
  REJECTED: 'red',
}

const leaveStatusLabel: Record<LeaveStatus, string> = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
}

export function LeaveStatusBadge({ status, className }: { status: LeaveStatus; className?: string }) {
  return (
    <Badge tone={leaveStatusTone[status]} className={className}>
      {leaveStatusLabel[status]}
    </Badge>
  )
}

const employmentStatusTone: Record<EmploymentStatus, Tone> = {
  ACTIVE: 'green',
  INACTIVE: 'slate',
}

export function EmploymentStatusBadge({ status, className }: { status: EmploymentStatus; className?: string }) {
  return (
    <Badge tone={employmentStatusTone[status]} className={className}>
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </Badge>
  )
}

const leaveTypeTone: Record<LeaveType, Tone> = {
  CASUAL: 'blue',
  EARNED: 'blue',
  SICK: 'red',
}

const leaveTypeLabel: Record<LeaveType, string> = {
  CASUAL: 'Casual Leave',
  SICK: 'Sick Leave',
  EARNED: 'Earned Leave',
}

export function LeaveTypeBadge({ type, className }: { type: LeaveType; className?: string }) {
  return (
    <Badge tone={leaveTypeTone[type]} className={className}>
      {leaveTypeLabel[type]}
    </Badge>
  )
}

export { leaveTypeLabel }
