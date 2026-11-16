import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, CalendarCheck, FileText } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { ApiError } from '@/lib/api'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'

const HIGHLIGHTS = [
  { icon: LayoutGrid, text: 'Dashboards tailored to HR, Managers, and Employees' },
  { icon: CalendarCheck, text: 'Apply, approve, and track leave in one place' },
  { icon: FileText, text: 'Employee documents, always one click away' },
]

export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Enter your work email and password to continue.')
      return
    }

    setSubmitting(true)
    try {
      const user = await login(email.trim(), password, remember)
      showToast('success', `Welcome back, ${user.fullName.split(' ')[0]}`, 'You have signed in successfully.')
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('That email and password combination is not recognized.')
      } else {
        setError('Something went wrong while signing in. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel — hidden below lg, where the compact header in the form panel takes over */}
      <div className="relative hidden w-[42%] shrink-0 flex-col justify-between bg-slate-900 px-12 py-12 lg:flex xl:px-16">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[12px] font-bold text-slate-900">
            i27
          </span>
          <span className="text-[18px] font-semibold tracking-[-0.01em] text-white">i27CoreHR</span>
        </div>

        <div>
          <h2 className="max-w-[360px] text-[26px] font-semibold leading-[1.3] tracking-[-0.01em] text-white">
            Employee &amp; leave management, without the busywork.
          </h2>
          <ul className="mt-8 space-y-4 border-t border-white/10 pt-8">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/15">
                  <Icon className="h-[15px] w-[15px] text-slate-300" strokeWidth={1.8} />
                </span>
                <span className="pt-1 text-[13.5px] leading-[1.5] text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[11.5px] text-slate-400">An i27Academy Product</p>
          <span className="rounded-[4px] px-1.5 py-[1px] text-[9.5px] font-semibold tracking-[.03em] text-slate-400 ring-1 ring-white/15">
            v1.1.1
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col px-6 py-10 sm:px-10">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-900 text-[12px] font-bold text-white">
            i27
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">i27CoreHR</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[380px]">
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">Sign in to your workspace</h1>
            <p className="mt-1.5 text-[13px] text-slate-500">Use your work email to continue</p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-slate-700">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya.nair@i27academy.com"
                  className="h-11 w-full rounded-md border border-slate-300 px-3.5 text-[13.5px] text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 w-full rounded-md border border-slate-300 px-3.5 pr-[70px] text-[13.5px] text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 focus:border-slate-500 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-1.5 top-1/2 h-[32px] -translate-y-1/2 rounded-md bg-slate-100 px-2.5 text-[11.5px] font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}

              <div className="flex items-center justify-between pt-0.5">
                <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
                <a href="#" className="text-[12.5px] font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" disabled={submitting} className="h-11 w-full">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-[11.5px] text-slate-400">
              Need access? Contact your HR administrator.
            </p>
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-300 lg:hidden">
          An i27Academy Product
          <span className="rounded-[5px] px-1.5 py-[1px] text-[9.5px] font-semibold tracking-[.03em] text-slate-400 ring-1 ring-slate-200">
            v1.1.1
          </span>
        </p>
      </div>
    </div>
  )
}
