import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import { usePageHeader } from '@/lib/page-header'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { api } from '@/lib/api'
import type { Employee, PageResponse } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FilterPill } from '@/components/ui/Pills'
import { Avatar } from '@/components/ui/Avatar'
import { EmploymentStatusBadge } from '@/components/ui/Badge'
import { EmployeeListSkeleton } from '@/components/ui/Skeleton'
import { AddEmployeeDialog, DEFAULT_PASSWORD } from '@/components/employees/AddEmployeeDialog'

const PAGE_SIZE = 8

export function EmployeesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isHr = user?.role === 'HR_ADMIN'

  usePageHeader(isHr ? 'Employees' : 'My Team', '')

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [dept, setDept] = useState('All')
  const [departments, setDepartments] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<Employee> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (isHr) {
      api.get<string[]>('/employees/departments').then(setDepartments).catch(() => {})
    }
  }, [isHr])

  useEffect(() => {
    setPage(0)
  }, [search, dept])

  useEffect(() => {
    setSearchParams(search.trim() ? { search: search.trim() } : {}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (dept !== 'All') params.set('department', dept)
    params.set('page', String(page))
    params.set('size', String(PAGE_SIZE))

    const debounce = setTimeout(
      () => {
        api
          .get<PageResponse<Employee>>(`/employees?${params.toString()}`)
          .then(setData)
          .catch(() => showToast('error', 'Could not load employees'))
          .finally(() => setLoading(false))
      },
      refreshTick > 0 ? 0 : 250,
    )

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dept, page, refreshTick])

  const pills = useMemo(() => ['All', ...departments], [departments])
  const items = data?.items ?? []
  const total = data?.total ?? 0

  function refresh() {
    setRefreshTick((t) => t + 1)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 px-[18px] py-3.5">
        <div className="relative w-[262px]">
          <Search className="pointer-events-none absolute left-[11px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" strokeWidth={1.7} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-9 w-full rounded-md border border-slate-300 pl-[34px] pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
          />
        </div>
        {isHr &&
          pills.map((d) => (
            <FilterPill key={d} active={dept === d} onClick={() => setDept(d)}>
              {d}
            </FilterPill>
          ))}
        <div className="ml-auto flex items-center gap-2.5">
          {isHr && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowSkeletonDemo(true)
                  setTimeout(() => setShowSkeletonDemo(false), 2600)
                }}
              >
                Show skeleton
              </Button>
              <Button size="sm" className="h-9" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add employee
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[2.2fr_1.2fr_1.6fr_1fr_88px] gap-3 bg-slate-50 px-[18px] py-[11px] border-b border-slate-200">
        {['Employee', 'Department', 'Designation', 'Status', 'Actions'].map((h, i) => (
          <span
            key={h}
            className={`text-[10.5px] font-semibold tracking-[.07em] text-slate-500 uppercase ${i === 4 ? 'text-right' : ''}`}
          >
            {h}
          </span>
        ))}
      </div>

      {loading || showSkeletonDemo ? (
        <EmployeeListSkeleton />
      ) : items.length === 0 ? (
        <p className="px-[18px] py-10 text-center text-[12.5px] text-slate-400">No employees match your filters.</p>
      ) : (
        items.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[2.2fr_1.2fr_1.6fr_1fr_88px] items-center gap-3 border-b border-slate-100 px-[18px] py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar id={e.id} name={e.fullName} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-900">{e.fullName}</p>
                <p className="truncate text-[11.5px] text-slate-400">
                  {e.employeeCode} · {e.email}
                </p>
              </div>
            </div>
            <span className="truncate text-[12.5px] text-slate-600">{e.department}</span>
            <span className="truncate text-[12.5px] text-slate-600">{e.designation}</span>
            <EmploymentStatusBadge status={e.employmentStatus} className="w-fit" />
            <div className="flex justify-end gap-1.5">
              <Button variant="secondary" size="xs" className="h-7" onClick={() => navigate(`/employees/${e.id}`)}>
                View
              </Button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))
      )}

      <div className="flex items-center justify-between px-[18px] py-3.5">
        <span className="text-[11.5px] text-slate-400">
          Showing {items.length} of {total} employee{total === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" className="h-7" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </Button>
          <Button
            variant="secondary"
            size="xs"
            className="h-7"
            disabled={data ? page >= data.totalPages - 1 : true}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {showAddDialog && (
        <AddEmployeeDialog
          departments={departments}
          onClose={() => setShowAddDialog(false)}
          onCreated={(employee) => {
            setShowAddDialog(false)
            showToast(
              'success',
              'Employee added',
              `${employee.fullName} can sign in with ${employee.email} and the password ${DEFAULT_PASSWORD}.`,
            )
            refresh()
          }}
        />
      )}
    </Card>
  )
}
