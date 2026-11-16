import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useDashboard } from '@/lib/dashboard'
import { usePageHeaderValue } from '@/lib/page-header'
import { useToast } from '@/lib/toast'
import { avatarTint, initials, titleCase } from '@/lib/format'

export function Topbar() {
  const { title, crumb } = usePageHeaderValue()
  const { user, logout } = useAuth()
  const { pendingLeaveCount } = useDashboard()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  const canSearchDirectory = user.role === 'HR_ADMIN' || user.role === 'MANAGER'
  const hasNotification = (user.role === 'HR_ADMIN' || user.role === 'MANAGER') && pendingLeaveCount > 0
  const tint = avatarTint(user.employeeId ?? user.id)

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-slate-900">{title}</p>
        {crumb && <p className="truncate text-[11.5px] text-slate-400">{crumb}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (canSearchDirectory && search.trim()) {
              navigate(`/employees?search=${encodeURIComponent(search.trim())}`)
            }
          }}
          className="relative hidden sm:block"
        >
          <Search className="pointer-events-none absolute left-[11px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" strokeWidth={1.7} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people, documents..."
            className="h-9 w-[246px] rounded-md border border-slate-200 bg-slate-50 pl-[34px] pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </form>

        <button
          type="button"
          onClick={() =>
            showToast(
              'info',
              hasNotification ? `${pendingLeaveCount} pending request${pendingLeaveCount === 1 ? '' : 's'}` : 'No new notifications',
              hasNotification ? 'Awaiting your review in Leave.' : "You're all caught up.",
            )
          }
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-[17px] w-[17px]" strokeWidth={1.6} />
          {hasNotification && (
            <span className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-red-600" />
          )}
        </button>

        <span className="h-[26px] w-px bg-slate-200" />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-slate-50"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
              style={{ background: tint.bg, color: tint.text }}
            >
              {initials(user.fullName)}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[12.5px] font-semibold text-slate-900">{user.fullName}</span>
              <span className="block text-[11px] text-slate-400">{titleCase(user.role)}</span>
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" strokeWidth={2} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-toast">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
              >
                <UserCircle className="h-4 w-4" strokeWidth={1.6} />
                My Profile
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.6} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
