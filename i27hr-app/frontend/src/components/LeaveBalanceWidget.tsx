import type { LeaveBalance, LeaveType } from '@/types'

const ORDER: LeaveType[] = ['CASUAL', 'SICK', 'EARNED']
const LABEL: Record<LeaveType, string> = { CASUAL: 'Casual leave', SICK: 'Sick leave', EARNED: 'Earned leave' }
const COLOR: Record<LeaveType, string> = { CASUAL: '#2563EB', SICK: '#F59E0B', EARNED: '#16A34A' }

function currentFinancialYear() {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear()
  return year
}

export function LeaveBalanceWidget({ balances }: { balances: LeaveBalance[] }) {
  const byType = new Map(balances.map((b) => [b.leaveType, b]))

  return (
    <div>
      <div className="flex items-center justify-between px-[18px] py-4 border-b border-slate-200">
        <h2 className="text-[13.5px] font-semibold text-slate-900">Leave balance</h2>
        <span className="text-[11.5px] text-slate-400">FY {currentFinancialYear()} · resets 31 Mar</span>
      </div>
      <div className="space-y-4 px-[18px] py-4">
        {ORDER.map((type) => {
          const b = byType.get(type)
          const total = b?.totalDays ?? 0
          const remaining = b?.remainingDays ?? 0
          const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0
          return (
            <div key={type}>
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span className="text-slate-600">{LABEL[type]}</span>
                <span className="text-slate-600">
                  <strong className="font-semibold text-slate-900">{remaining}</strong> of {total} left
                </span>
              </div>
              <div className="mt-1.5 h-[7px] rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${pct}%`, background: COLOR[type] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
