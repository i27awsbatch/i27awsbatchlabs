export function EmployeeRowSkeleton() {
  return (
    <div className="grid grid-cols-[2.2fr_1.2fr_1.6fr_1fr_88px] items-center gap-3 border-b border-slate-100 px-[18px] py-3">
      <div className="flex items-center gap-3">
        <span className="skeleton-shimmer h-[34px] w-[34px] shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <span className="skeleton-shimmer block h-[11px] w-[65%] rounded-[6px]" />
          <span className="skeleton-shimmer block h-[9px] w-[45%] rounded-[6px]" />
        </div>
      </div>
      <span className="skeleton-shimmer h-[11px] w-[70%] rounded-[6px]" />
      <span className="skeleton-shimmer h-[11px] w-[70%] rounded-[6px]" />
      <span className="skeleton-shimmer h-[22px] w-[78px] rounded-[7px]" />
      <span className="skeleton-shimmer h-[22px] w-[60px] rounded-[6px] justify-self-end" />
    </div>
  )
}

export function EmployeeListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <EmployeeRowSkeleton key={i} />
      ))}
    </div>
  )
}
