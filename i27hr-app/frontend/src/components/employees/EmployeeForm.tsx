import { useEffect, useState } from 'react'
import { Label, HelpText, TextInput, SelectInput, type FieldState } from '@/components/ui/Field'
import { api } from '@/lib/api'
import type { Employee, EmploymentStatus, Role } from '@/types'

export interface EmployeeFormValue {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  managerId: string
  joiningDate: string
  location: string
  employmentStatus: EmploymentStatus
  role: Role
  emergencyContact: string
}

export const emptyEmployeeForm: EmployeeFormValue = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  managerId: '',
  joiningDate: '',
  location: '',
  employmentStatus: 'ACTIVE',
  role: 'EMPLOYEE',
  emergencyContact: '',
}

export function employeeToFormValue(e: Employee): EmployeeFormValue {
  return {
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    phone: e.phone ?? '',
    department: e.department,
    designation: e.designation,
    managerId: e.managerId ? String(e.managerId) : '',
    joiningDate: e.joiningDate,
    location: e.location ?? '',
    employmentStatus: e.employmentStatus,
    role: e.role,
    emergencyContact: e.emergencyContact ?? '',
  }
}

export function validateEmployeeForm(v: EmployeeFormValue) {
  const errors: Partial<Record<keyof EmployeeFormValue, string>> = {}
  if (!v.firstName.trim()) errors.firstName = 'First name is required'
  if (!v.lastName.trim()) errors.lastName = 'Last name is required'
  if (!v.email.trim()) errors.email = 'Work email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Enter a valid work email address'
  if (!v.phone.trim()) errors.phone = 'Phone number is required'
  else if (!/^[0-9]{10}$/.test(v.phone)) errors.phone = 'Enter a valid 10-digit mobile number'
  if (!v.department.trim()) errors.department = 'Department is required'
  if (!v.designation.trim()) errors.designation = 'Designation is required'
  if (!v.joiningDate) errors.joiningDate = 'Joining date is required'
  return errors
}

interface Props {
  value: EmployeeFormValue
  onChange: (value: EmployeeFormValue) => void
  errors: Partial<Record<keyof EmployeeFormValue, string>>
  departments: string[]
  excludeManagerId?: number
}

export function EmployeeForm({ value, onChange, errors, departments, excludeManagerId }: Props) {
  const [managers, setManagers] = useState<Employee[]>([])

  useEffect(() => {
    api
      .get<{ items: Employee[] }>('/employees?size=200')
      .then((res) => setManagers(res.items.filter((m) => m.id !== excludeManagerId)))
      .catch(() => {})
  }, [excludeManagerId])

  function set<K extends keyof EmployeeFormValue>(key: K, val: EmployeeFormValue[K]) {
    onChange({ ...value, [key]: val })
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)
  const phoneValid = /^[0-9]{10}$/.test(value.phone)

  function state(field: keyof EmployeeFormValue): FieldState {
    if (errors[field]) return 'error'
    if (field === 'email' && value.email && emailValid) return 'ok'
    if (field === 'phone' && value.phone && phoneValid) return 'ok'
    return 'default'
  }

  return (
    <div className="grid grid-cols-2 gap-x-[18px] gap-y-4">
      <div>
        <Label>First name</Label>
        <TextInput state={state('firstName')} value={value.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Priya" />
        {errors.firstName && <HelpText state="error">{errors.firstName}</HelpText>}
      </div>
      <div>
        <Label>Last name</Label>
        <TextInput state={state('lastName')} value={value.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Nair" />
        {errors.lastName && <HelpText state="error">{errors.lastName}</HelpText>}
      </div>

      <div>
        <Label>Work email</Label>
        <TextInput
          state={state('email')}
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="priya.nair@i27academy.com"
        />
        {errors.email ? (
          <HelpText state="error">{errors.email}</HelpText>
        ) : value.email && emailValid ? (
          <HelpText state="ok">Looks like a valid work email.</HelpText>
        ) : null}
      </div>
      <div>
        <Label>Phone</Label>
        <TextInput
          state={state('phone')}
          value={value.phone}
          onChange={(e) => set('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
          placeholder="9845011234"
        />
        {errors.phone ? (
          <HelpText state="error">{errors.phone}</HelpText>
        ) : (
          <HelpText state={value.phone && phoneValid ? 'ok' : 'default'}>
            {value.phone && phoneValid ? 'Looks good.' : '10 digits, no country code.'}
          </HelpText>
        )}
      </div>

      <div>
        <Label>Department</Label>
        <TextInput
          state={state('department')}
          value={value.department}
          onChange={(e) => set('department', e.target.value)}
          placeholder="Engineering"
          list="department-options"
        />
        <datalist id="department-options">
          {departments.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        {errors.department && <HelpText state="error">{errors.department}</HelpText>}
      </div>
      <div>
        <Label>Designation</Label>
        <TextInput
          state={state('designation')}
          value={value.designation}
          onChange={(e) => set('designation', e.target.value)}
          placeholder="Senior Software Engineer"
        />
        {errors.designation && <HelpText state="error">{errors.designation}</HelpText>}
      </div>

      <div>
        <Label>Reporting manager</Label>
        <SelectInput value={value.managerId} onChange={(e) => set('managerId', e.target.value)}>
          <option value="">No manager</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName} — {m.designation}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <Label>Joining date</Label>
        <TextInput
          type="date"
          state={state('joiningDate')}
          value={value.joiningDate}
          onChange={(e) => set('joiningDate', e.target.value)}
        />
        {errors.joiningDate && <HelpText state="error">{errors.joiningDate}</HelpText>}
      </div>

      <div>
        <Label>Location</Label>
        <TextInput value={value.location} onChange={(e) => set('location', e.target.value)} placeholder="Bengaluru, India" />
      </div>
      <div>
        <Label>Emergency contact</Label>
        <TextInput
          value={value.emergencyContact}
          onChange={(e) => set('emergencyContact', e.target.value)}
          placeholder="Name · phone number"
        />
      </div>

      <div>
        <Label>Status</Label>
        <SelectInput value={value.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value as EmploymentStatus)}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectInput>
      </div>
      <div>
        <Label>Role</Label>
        <SelectInput value={value.role} onChange={(e) => set('role', e.target.value as Role)}>
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="HR_ADMIN">HR Admin</option>
        </SelectInput>
      </div>
    </div>
  )
}
