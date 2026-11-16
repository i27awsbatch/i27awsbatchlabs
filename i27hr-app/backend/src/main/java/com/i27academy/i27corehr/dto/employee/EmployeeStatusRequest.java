package com.i27academy.i27corehr.dto.employee;

import com.i27academy.i27corehr.entity.EmploymentStatus;
import jakarta.validation.constraints.NotNull;

public record EmployeeStatusRequest(@NotNull(message = "Status is required") EmploymentStatus employmentStatus) {
}
