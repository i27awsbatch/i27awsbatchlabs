export type Role = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE'

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED'

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface SessionUser {
  id: number
  employeeId: number | null
  employeeCode: string | null
  fullName: string
  email: string
  role: Role
  designation: string | null
  department: string | null
  managerName: string | null
}

export interface Employee {
  id: number
  employeeCode: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  department: string
  designation: string
  managerId: number | null
  managerName: string | null
  joiningDate: string
  location: string | null
  employmentStatus: EmploymentStatus
  profileImage: string | null
  role: Role
  emergencyContact: string | null
  updatedAt: string | null
}

export interface LeaveBalance {
  leaveType: LeaveType
  totalDays: number
  usedDays: number
  remainingDays: number
}

export interface LeaveRequest {
  id: number
  employeeId: number
  employeeName: string
  employeeDesignation?: string | null
  employeeDepartment?: string | null
  leaveType: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  reviewedBy: string | null
  reviewerComment: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface EmployeeDocument {
  id: number
  employeeId: number
  employeeName?: string
  documentType: string
  fileName: string
  fileSize: number | null
  uploadedBy: string
  uploadedAt: string
  notes: string | null
}

export interface DashboardStats {
  totalEmployees?: number
  newThisMonth?: number
  onLeaveToday?: number
  unplannedOnLeave?: number
  pendingRequests?: number
  oldestPendingDays?: number
  departmentCount?: number
  largestDepartment?: string
  teamSize?: number
  onLeaveThisWeek?: number
  pendingApprovals?: number
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface ActivityItem {
  id: number
  actor: string
  message: string
  kind: 'approve' | 'submit' | 'system'
  timestamp: string
}
