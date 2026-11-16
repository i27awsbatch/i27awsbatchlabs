package com.i27academy.i27corehr.dto.leave;

import com.i27academy.i27corehr.entity.LeaveType;

public record LeaveBalanceDto(LeaveType leaveType, int totalDays, int usedDays, int remainingDays) {
}
