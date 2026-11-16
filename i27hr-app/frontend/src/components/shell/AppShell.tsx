import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DashboardProvider } from '@/lib/dashboard'
import { PageHeaderProvider } from '@/lib/page-header'

export function AppShell() {
  return (
    <DashboardProvider>
      <PageHeaderProvider>
        <div className="flex min-h-screen bg-[#F7F8FA]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-7 pb-10 pt-[26px]">
              <Outlet />
            </main>
          </div>
        </div>
      </PageHeaderProvider>
    </DashboardProvider>
  )
}
