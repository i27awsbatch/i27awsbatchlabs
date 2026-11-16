import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ToastProvider } from '@/lib/toast'
import { ToastViewport } from '@/components/ui/Toast'
import { AppShell } from '@/components/shell/AppShell'
import { ProtectedRoute } from '@/components/shell/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { LeavePage } from '@/pages/LeavePage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute roles={['HR_ADMIN', 'MANAGER']}>
                    <EmployeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id"
                element={
                  <ProtectedRoute roles={['HR_ADMIN', 'MANAGER']}>
                    <EmployeeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/leave" element={<LeavePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastViewport />
      </ToastProvider>
    </AuthProvider>
  )
}
