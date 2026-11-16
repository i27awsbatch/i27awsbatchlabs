package com.i27academy.i27corehr.dto.leave;

import com.i27academy.i27corehr.entity.LeaveStatus;
import com.i27academy.i27corehr.entity.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestDto(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeDesignation,
        String employeeDepartment,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        int days,
        String reason,
        LeaveStatus status,
        String reviewedBy,
        String reviewerComment,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt) {
}
