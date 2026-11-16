import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/lib/toast'
import { api, ApiError } from '@/lib/api'
import type { Employee } from '@/types'
import { EmployeeForm, emptyEmployeeForm, validateEmployeeForm, type EmployeeFormValue } from './EmployeeForm'

// Must match EmployeeService.DEFAULT_PASSWORD on the backend — every employee HR creates gets
// this password and is expected to be told to change it (no self-service reset flow yet).
export const DEFAULT_PASSWORD = 'Passw0rd!'

export function AddEmployeeDialog({
  departments,
  onClose,
  onCreated,
}: {
  departments: string[]
  onClose: () => void
  onCreated: (employee: Employee) => void
}) {
  const { showToast } = useToast()
  const [value, setValue] = useState<EmployeeFormValue>(emptyEmployeeForm)
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormValue, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const validation = validateEmployeeForm(value)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      const employee = await api.post<Employee>('/employees', {
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
      onCreated(employee)
    } catch (err) {
      showToast('error', 'Could not add employee', err instanceof ApiError ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Add employee"
      subtitle={`They'll sign in with the work email below and the default password "${DEFAULT_PASSWORD}" — share it with them directly.`}
      onClose={onClose}
      maxWidth={640}
    >
      <div className="px-6 py-5">
        <EmployeeForm value={value} onChange={setValue} errors={errors} departments={departments} />
      </div>
      <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Adding…' : 'Add employee'}
        </Button>
      </div>
    </Modal>
  )
}
