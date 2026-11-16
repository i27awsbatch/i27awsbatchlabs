import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users, Calendar, FileText, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useDashboard } from '@/lib/dashboard'
import { cn } from '@/lib/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutGrid
  chip?: boolean
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { pendingLeaveCount } = useDashboard()
  if (!user) return null

  const isHrOrManager = user.role === 'HR_ADMIN' || user.role === 'MANAGER'

  const items: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutGrid },
    ...(user.role !== 'EMPLOYEE'
      ? [{ to: '/employees', label: user.role === 'HR_ADMIN' ? 'Employees' : 'My Team', icon: Users }]
      : []),
    { to: '/leave', label: 'Leave', icon: Calendar, chip: isHrOrManager },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ]

  return (
    <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-white px-[10px] pb-4 pt-[18px]">
      <div className="border-b border-sidebar-divider pb-4">
        <div className="flex items-center gap-2.5 px-[3px]">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-[11.5px] font-bold text-white">
            i27
          </span>
          <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-sidebar-text">i27CoreHR</p>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <p className="px-[11px] pb-[7px] text-[10px] font-semibold tracking-[.09em] text-sidebar-text-label uppercase">
          Workspace
        </p>
        <nav className="flex flex-col gap-[1px]">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md border-l-2 px-[9px] py-[7px] text-[13px] transition-colors duration-150',
                  isActive
                    ? 'border-l-slate-900 bg-slate-100 font-semibold text-sidebar-text'
                    : 'border-l-transparent font-medium text-sidebar-text-idle hover:bg-sidebar-hover hover:text-slate-900',
                )
              }
            >
              <item.icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.6} />
              <span className="truncate">{item.label}</span>
              {item.chip && pendingLeaveCount > 0 && (
                <span className="ml-auto grid h-[18px] min-w-[19px] place-items-center rounded-[4px] bg-amber-100 px-1 text-[10.5px] font-bold text-amber-700">
                  {pendingLeaveCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-sidebar-divider-soft pt-3.5">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-md px-[9px] py-[7px] text-[13px] font-medium text-sidebar-text-signout transition-colors duration-150 hover:bg-sidebar-hover hover:text-slate-900"
        >
          <LogOut className="h-[15px] w-[15px]" strokeWidth={1.6} />
          Sign out
        </button>
        <div className="mt-3 flex items-center justify-between gap-2 px-[9px]">
          <p className="truncate text-[10px] text-sidebar-text-label">An i27Academy Product</p>
          <span className="shrink-0 rounded-[4px] px-1.5 py-[1px] text-[9px] font-semibold tracking-[.03em] text-sidebar-text-label ring-1 ring-sidebar-divider-soft">
            v1.1.0
          </span>
        </div>
      </div>
    </aside>
  )
}
