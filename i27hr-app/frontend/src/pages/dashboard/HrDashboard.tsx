import { useDashboard } from '@/lib/dashboard'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { LeaveStatusBadge } from '@/components/ui/Badge'
import { ActivityFeed } from '@/components/ActivityFeed'
import { formatDate, formatDateRange } from '@/lib/format'
import { leaveTypeLabel } from '@/components/ui/Badge'

export function HrDashboard() {
  const { data, loading } = useDashboard()
  const stats = data?.stats

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
        <StatCard
          label="Total employees"
          value={loading ? '—' : (stats?.totalEmployees ?? 0)}
          delta={stats?.newThisMonth ? `+${stats.newThisMonth} this month` : undefined}
          deltaTone="positive"
        />
        <StatCard
          label="On leave today"
          value={loading ? '—' : (stats?.onLeaveToday ?? 0)}
          delta={stats?.unplannedOnLeave ? `${stats.unplannedOnLeave} unplanned` : 'None unplanned'}
          deltaTone="warning"
        />
        <StatCard
          label="Pending requests"
          value={loading ? '—' : (stats?.pendingRequests ?? 0)}
          delta={
            stats?.pendingRequests
              ? stats.oldestPendingDays
                ? `Oldest ${stats.oldestPendingDays} day${stats.oldestPendingDays === 1 ? '' : 's'} ago`
                : 'Submitted today'
              : 'All caught up'
          }
          deltaTone="warning"
        />
        <StatCard
          label="Departments"
          value={loading ? '—' : (stats?.departmentCount ?? 0)}
          delta={stats?.largestDepartment ? `${stats.largestDepartment} largest` : undefined}
          deltaTone="positive"
        />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-4 items-start">
        <Card>
          <CardHeader title="Recent leave requests" linkLabel="View all" linkTo="/leave" />
          <div>
            {(data?.recentLeaveRequests ?? []).length === 0 && !loading && (
              <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">No leave requests yet.</p>
            )}
            {(data?.recentLeaveRequests ?? []).map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                <Avatar id={r.employeeId} name={r.employeeName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{r.employeeName}</p>
                  <p className="truncate text-[11.5px] text-slate-500">
                    {leaveTypeLabel[r.leaveType]} · {formatDateRange(r.startDate, r.endDate)} · {r.days} day
                    {r.days === 1 ? '' : 's'}
                  </p>
                </div>
                <LeaveStatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recently added" linkLabel="Directory" linkTo="/employees" />
          <div>
            {(data?.recentlyAdded ?? []).map((e) => (
              <div key={e.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                <Avatar id={e.id} name={e.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{e.fullName}</p>
                  <p className="truncate text-[11.5px] text-slate-500">{e.designation}</p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">{formatDate(e.joiningDate)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent activity" />
        <ActivityFeed items={data?.activity ?? []} />
      </Card>
    </div>
  )
}
