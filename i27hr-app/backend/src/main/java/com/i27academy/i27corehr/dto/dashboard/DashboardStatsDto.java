package com.i27academy.i27corehr.dto.dashboard;

public record DashboardStatsDto(
        Integer totalEmployees,
        Integer newThisMonth,
        Integer onLeaveToday,
        Integer unplannedOnLeave,
        Integer pendingRequests,
        Integer oldestPendingDays,
        Integer departmentCount,
        String largestDepartment,
        Integer teamSize,
        Integer onLeaveThisWeek,
        Integer pendingApprovals) {
}
