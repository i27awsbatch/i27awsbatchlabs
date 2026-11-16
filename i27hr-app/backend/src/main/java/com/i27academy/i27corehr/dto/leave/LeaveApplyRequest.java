package com.i27academy.i27corehr.dto.leave;

import com.i27academy.i27corehr.entity.LeaveType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record LeaveApplyRequest(
        @NotNull(message = "Leave type is required") LeaveType leaveType,
        @NotNull(message = "Start date is required") LocalDate startDate,
        @NotNull(message = "End date is required") LocalDate endDate,
        @Size(max = 500, message = "Reason must be 500 characters or fewer")
        String reason) {
}
