import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { usePageHeader } from '@/lib/page-header'
import { useToast } from '@/lib/toast'
import { api, ApiError } from '@/lib/api'
import type { Employee } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { EmploymentStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatDateTime } from '@/lib/format'
import { EmployeeForm, employeeToFormValue, validateEmployeeForm, type EmployeeFormValue } from '@/components/employees/EmployeeForm'

export function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [value, setValue] = useState<EmployeeFormValue | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormValue, string>>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  usePageHeader('Employee record', `Employees / ${employee?.fullName ?? ''}`)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get<Employee>(`/employees/${id}`),
      api.get<string[]>('/employees/departments').catch(() => []),
    ])
      .then(([emp, depts]) => {
        setEmployee(emp)
        setValue(employeeToFormValue(emp))
        setDepartments(depts)
      })
      .catch(() => showToast('error', 'Could not load employee'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSave() {
    if (!value || !employee) return
    const validation = validateEmployeeForm(value)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      const updated = await api.put<Employee>(`/employees/${employee.id}`, {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
        phone: value.phone,
        department: value.department.trim(),
        designation: value.designation.trim(),
        managerId: value.managerId ? Number(value.managerId) : null,
        joiningDate: value.joiningDate,
        location: value.location.trim() || null,
        employmentStatus: value.employmentStatus,
        role: value.role,
        emergencyContact: value.emergencyContact.trim() || null,
      })
      showToast('success', 'Employee updated', `${updated.fullName}'s record has been saved.`)
      navigate('/employees')
    } catch (err) {
      showToast('error', 'Could not save changes', err instanceof ApiError ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !employee || !value) {
    return (
      <div>
        <Link to="/employees" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} /> Directory
        </Link>
        <p className="mt-8 text-center text-[13px] text-slate-400">Loading employee…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate('/employees')}>
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          Directory
        </Button>
        <span className="text-[12px] text-slate-400">/ {employee.fullName}</span>
      </div>

      <div className="mt-4 grid grid-cols-[288px_1fr] items-start gap-4">
        <Card className="p-5 text-center">
          <Avatar id={employee.id} name={employee.fullName} size="xl" className="mx-auto" />
          <Button variant="secondary" size="xs" className="mt-3.5 h-7">
            Change photo
          </Button>
          <p className="mt-3.5 text-[16px] font-semibold text-slate-900">{employee.fullName}</p>
          <p className="text-[12.5px] text-slate-500">{employee.designation}</p>
          <EmploymentStatusBadge status={employee.employmentStatus} className="mt-2.5" />

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-left">
            {[
              ['Employee ID', employee.employeeCode],
              ['Department', employee.department],
              ['Reports to', employee.managerName ?? '—'],
              ['Joined', formatDate(employee.joiningDate)],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between text-[12px]">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-[13.5px] font-semibold text-slate-900">Edit employee</h2>
            <p className="mt-0.5 text-[11.5px] text-slate-400">Changes are logged to the activity feed</p>
          </div>
          <div className="p-5">
            <EmployeeForm
              value={value}
              onChange={setValue}
              errors={errors}
              departments={departments}
              excludeManagerId={employee.id}
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
            <span className="text-[11.5px] text-slate-400">
              {employee.updatedAt ? `Last updated ${formatDateTime(employee.updatedAt)}` : ''}
            </span>
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => navigate('/employees')}>
                Cancel
              </Button>
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
