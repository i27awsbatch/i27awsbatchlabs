import type { ActivityItem } from '@/types'
import { timeAgo } from '@/lib/format'

const DOT_COLOR: Record<ActivityItem['kind'], string> = {
  approve: '#16A34A',
  submit: '#2563EB',
  system: '#64748B',
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">No recent activity yet.</p>
  }

  return (
    <div className="px-[18px] py-4">
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex w-[9px] shrink-0 flex-col items-center">
            <span className="mt-[5px] h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: DOT_COLOR[item.kind] }} />
            {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
          </div>
          <div className={i < items.length - 1 ? 'pb-4' : ''}>
            <p className="text-[12.5px] leading-[1.5] text-slate-700">
              <strong className="font-semibold text-slate-900">{item.actor}</strong> {item.message}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
