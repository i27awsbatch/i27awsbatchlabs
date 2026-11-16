package com.i27academy.i27corehr.dto.employee;

import com.i27academy.i27corehr.entity.EmploymentStatus;
import com.i27academy.i27corehr.entity.Role;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record EmployeeUpsertRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
        @NotBlank(message = "Work email is required")
        @Email(message = "Enter a valid work email address")
        String email,
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Enter a valid 10-digit mobile number")
        String phone,
        @NotBlank(message = "Department is required") String department,
        @NotBlank(message = "Designation is required") String designation,
        Long managerId,
        @NotNull(message = "Joining date is required") LocalDate joiningDate,
        String location,
        @NotNull(message = "Status is required") EmploymentStatus employmentStatus,
        @NotNull(message = "Role is required") Role role,
        String emergencyContact) {
}
