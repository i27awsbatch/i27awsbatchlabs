package com.i27academy.i27corehr.service;

import com.i27academy.i27corehr.dto.dashboard.ActivityItemDto;
import com.i27academy.i27corehr.dto.dashboard.DashboardResponseDto;
import com.i27academy.i27corehr.dto.dashboard.DashboardStatsDto;
import com.i27academy.i27corehr.entity.*;
import com.i27academy.i27corehr.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ActivityLogRepository activityLogRepository;
    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final DocumentService documentService;

    public DashboardService(
            EmployeeRepository employeeRepository,
            LeaveRequestRepository leaveRequestRepository,
            ActivityLogRepository activityLogRepository,
            EmployeeService employeeService,
            LeaveService leaveService,
            DocumentService documentService) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.activityLogRepository = activityLogRepository;
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.documentService = documentService;
    }

    public DashboardResponseDto forHr() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        long totalEmployees = employeeRepository.count();
        long newThisMonth = employeeRepository.findAll().stream()
                .filter(e -> !e.getCreatedAt().toLocalDate().isBefore(monthStart))
                .count();

        List<LeaveRequest> approvedToday = leaveRequestRepository
                .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(LeaveStatus.APPROVED, today, today);
        long unplanned = approvedToday.stream().filter(r -> r.getLeaveType() == LeaveType.SICK).count();

        long pending = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
        List<LeaveRequest> pendingList = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);
        Integer oldestPendingDays = pendingList.stream()
                .min((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(r -> (int) ChronoUnit.DAYS.between(r.getCreatedAt().toLocalDate(), today))
                .orElse(0);

        Map<String, Long> byDept = employeeRepository.findAll().stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
        String largestDept = byDept.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        DashboardStatsDto stats = new DashboardStatsDto(
                (int) totalEmployees,
                (int) newThisMonth,
                approvedToday.size(),
                (int) unplanned,
                (int) pending,
                oldestPendingDays,
                byDept.size(),
                largestDept,
                null, null, null);

        List<ActivityItemDto> activity = activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8))
                .stream().map(this::toActivityDto).toList();

        return new DashboardResponseDto(
                stats,
                leaveRequestRepository.findTop5ByOrderByCreatedAtDesc().stream().map(leaveService::toDto).toList(),
                employeeService.recentlyAdded(5),
                activity,
                null, null, null, null, null, null);
    }

    public DashboardResponseDto forManager(Employee manager) {
        List<Employee> reports = employeeRepository.findByManagerIdOrderByFirstNameAsc(manager.getId());
        List<Long> reportIds = reports.stream().map(Employee::getId).toList();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        long onLeaveThisWeek = reportIds.isEmpty() ? 0 : leaveRequestRepository
                .findByEmployeeIdInAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        reportIds, LeaveStatus.APPROVED, weekEnd, weekStart)
                .size();

        long pendingApprovals = reportIds.isEmpty() ? 0
                : leaveRequestRepository.countByEmployeeIdInAndStatus(reportIds, LeaveStatus.PENDING);

        DashboardStatsDto stats = new DashboardStatsDto(
                null, null, null, null, null, null, null, null,
                reports.size(), (int) onLeaveThisWeek, (int) pendingApprovals);

        List<Long> teamAndSelf = new java.util.ArrayList<>(reportIds);
        teamAndSelf.add(manager.getId());
        List<ActivityItemDto> activity = activityLogRepository
                .findByActorEmployeeIdInOrderByCreatedAtDesc(teamAndSelf, PageRequest.of(0, 8))
                .stream().map(this::toActivityDto).toList();

        List<com.i27academy.i27corehr.dto.leave.LeaveRequestDto> outOfOffice = reportIds.isEmpty() ? List.of()
                : leaveRequestRepository
                        .findByEmployeeIdInAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                reportIds, LeaveStatus.APPROVED, weekEnd, weekStart)
                        .stream().map(leaveService::toDto).toList();

        return new DashboardResponseDto(
                stats,
                null, null, activity,
                leaveService.team(manager.getId(), LeaveStatus.PENDING),
                outOfOffice,
                null, null, null, null);
    }

    public DashboardResponseDto forEmployee(Employee employee) {
        return new DashboardResponseDto(
                new DashboardStatsDto(null, null, null, null, null, null, null, null, null, null, null),
                null, null, null, null, null,
                employeeService.get(employee.getId()),
                leaveService.balances(employee.getId()),
                leaveService.mine(employee.getId()).stream().limit(5).toList(),
                documentService.recentForEmployee(employee.getId(), 5));
    }

    private ActivityItemDto toActivityDto(ActivityLog log) {
        String kind = switch (log.getKind()) {
            case APPROVE -> "approve";
            case SUBMIT -> "submit";
            case SYSTEM -> "system";
        };
        return new ActivityItemDto(log.getId(), log.getActorName(), log.getMessage(), kind, log.getCreatedAt());
    }
}
