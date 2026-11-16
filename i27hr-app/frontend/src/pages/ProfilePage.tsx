import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { usePageHeader } from '@/lib/page-header'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast'
import { api } from '@/lib/api'
import type { Employee, EmployeeDocument, LeaveBalance } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FieldGrid, FieldRow } from '@/components/ui/FieldGrid'
import { LeaveBalanceWidget } from '@/components/LeaveBalanceWidget'
import { FileTypeChip } from '@/components/FileTypeChip'
import { formatDate, titleCase } from '@/lib/format'
import { triggerDocumentDownload } from '@/lib/download'

export function ProfilePage() {
  usePageHeader('My Profile', 'Personal and work details')
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [documents, setDocuments] = useState<EmployeeDocument[]>([])

  useEffect(() => {
    if (!user?.employeeId) return
    api.get<Employee>(`/employees/${user.employeeId}`).then(setEmployee).catch(() => {})
    api.get<LeaveBalance[]>('/leaves/balances').then(setBalances).catch(() => {})
    api.get<EmployeeDocument[]>('/documents').then(setDocuments).catch(() => {})
  }, [user?.employeeId])

  if (!user) return null

  return (
    <div className="space-y-4">
      <Card className="px-7 py-[22px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar id={employee?.id ?? 0} name={user.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-semibold text-slate-900">{user.fullName}</h1>
                <span className="inline-grid h-[22px] place-items-center rounded-md bg-green-100 px-2.5 text-[11px] font-semibold text-green-700">
                  Active
                </span>
              </div>
              <p className="mt-1 text-[13px] text-slate-600">
                {[employee?.designation ?? user.designation, employee?.department ?? user.department, employee?.location]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {[
                  employee?.employeeCode ? `Employee ID ${employee.employeeCode}` : null,
                  employee ? `joined ${formatDate(employee.joiningDate)}` : null,
                  employee?.managerName ? `reports to ${employee.managerName}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (user.role === 'HR_ADMIN' && employee) navigate(`/employees/${employee.id}`)
              else showToast('info', 'Contact HR to update your profile', 'Employee records are managed by HR.')
            }}
          >
            Edit profile
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-[1.4fr_1fr] items-start gap-4">
        <Card className="p-5">
          <h2 className="text-[13.5px] font-semibold text-slate-900">Personal &amp; work details</h2>
          <FieldGrid className="mt-4">
            <FieldRow label="Full name" value={employee?.fullName ?? user.fullName} />
            <FieldRow label="Employee ID" value={employee?.employeeCode ?? user.employeeCode} />
            <FieldRow label="Work email" value={employee?.email ?? user.email} />
            <FieldRow label="Phone" value={employee?.phone} />
            <FieldRow label="Department" value={employee?.department ?? user.department} />
            <FieldRow label="Designation" value={employee?.designation ?? user.designation} />
            <FieldRow label="Reporting manager" value={employee?.managerName ?? user.managerName} />
            <FieldRow label="Joining date" value={employee && formatDate(employee.joiningDate)} />
            <FieldRow label="Location" value={employee?.location} />
            <FieldRow label="Role" value={titleCase(user.role)} />
            <FieldRow label="Emergency contact" value={employee?.emergencyContact} />
            <FieldRow label="Status" value={employee?.employmentStatus === 'ACTIVE' ? 'Active' : 'Inactive'} />
          </FieldGrid>
        </Card>

        <div className="space-y-4">
          <Card>
            <LeaveBalanceWidget balances={balances} />
          </Card>

          <Card>
            <div className="border-b border-slate-200 px-[18px] py-4">
              <h2 className="text-[13.5px] font-semibold text-slate-900">My documents</h2>
            </div>
            <div>
              {documents.length === 0 && (
                <p className="px-[18px] py-6 text-center text-[12.5px] text-slate-400">No documents yet.</p>
              )}
              {documents.map((d) => (
                <div key={d.id} className="flex items-center gap-3 border-b border-slate-100 px-[18px] py-3 last:border-b-0">
                  <FileTypeChip fileName={d.fileName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{d.fileName}</p>
                    <p className="truncate text-[11px] text-slate-500">{formatDate(d.uploadedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerDocumentDownload(d.id, d.fileName)
                      showToast('success', 'Download started', `${d.fileName} is downloading.`)
                    }}
                    className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Get
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
