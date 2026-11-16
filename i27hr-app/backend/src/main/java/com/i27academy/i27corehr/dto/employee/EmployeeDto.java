package com.i27academy.i27corehr.dto.employee;

import com.i27academy.i27corehr.entity.EmploymentStatus;
import com.i27academy.i27corehr.entity.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeDto(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone,
        String department,
        String designation,
        Long managerId,
        String managerName,
        LocalDate joiningDate,
        String location,
        EmploymentStatus employmentStatus,
        String profileImage,
        Role role,
        String emergencyContact,
        LocalDateTime updatedAt) {
}
