package com.i27academy.i27corehr.dto.dashboard;

import com.i27academy.i27corehr.dto.document.DocumentDto;
import com.i27academy.i27corehr.dto.employee.EmployeeDto;
import com.i27academy.i27corehr.dto.leave.LeaveBalanceDto;
import com.i27academy.i27corehr.dto.leave.LeaveRequestDto;

import java.util.List;

public record DashboardResponseDto(
        DashboardStatsDto stats,
        List<LeaveRequestDto> recentLeaveRequests,
        List<EmployeeDto> recentlyAdded,
        List<ActivityItemDto> activity,
        List<LeaveRequestDto> pendingApprovals,
        List<LeaveRequestDto> outOfOffice,
        EmployeeDto employee,
        List<LeaveBalanceDto> leaveBalances,
        List<LeaveRequestDto> myRecentRequests,
        List<DocumentDto> recentDocuments) {
}
