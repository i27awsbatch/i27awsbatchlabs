package com.i27academy.i27corehr.service;

import com.i27academy.i27corehr.dto.leave.LeaveApplyRequest;
import com.i27academy.i27corehr.dto.leave.LeaveBalanceDto;
import com.i27academy.i27corehr.dto.leave.LeaveRequestDto;
import com.i27academy.i27corehr.entity.*;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.exception.ResourceNotFoundException;
import com.i27academy.i27corehr.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityLogRepository activityLogRepository;

    public LeaveService(
            LeaveRequestRepository leaveRequestRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            EmployeeRepository employeeRepository,
            ActivityLogRepository activityLogRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<LeaveBalanceDto> balances(Long employeeId) {
        return leaveBalanceRepository.findByEmployeeIdOrderByLeaveTypeAsc(employeeId).stream()
                .map(b -> new LeaveBalanceDto(b.getLeaveType(), b.getTotalDays(), b.getUsedDays(), b.getRemainingDays()))
                .toList();
    }

    public List<LeaveRequestDto> mine(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<LeaveRequestDto> team(Long managerId, LeaveStatus status) {
        List<Long> reportIds = employeeRepository.findByManagerIdOrderByFirstNameAsc(managerId).stream()
                .map(Employee::getId)
                .toList();
        if (reportIds.isEmpty()) return List.of();
        List<LeaveRequest> requests = status != null
                ? leaveRequestRepository.findByEmployeeIdInAndStatusOrderByCreatedAtDesc(reportIds, status)
                : leaveRequestRepository.findByEmployeeIdInOrderByCreatedAtDesc(reportIds);
        return requests.stream().map(this::toDto).toList();
    }

    public List<LeaveRequestDto> all(LeaveStatus status) {
        List<LeaveRequest> requests = status != null
                ? leaveRequestRepository.findByStatusOrderByCreatedAtDesc(status)
                : leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        return requests.stream().map(this::toDto).toList();
    }

    @Transactional
    public LeaveRequestDto apply(Long employeeId, LeaveApplyRequest req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw new ApiException("End date must be on or after the start date.", HttpStatus.BAD_REQUEST);
        }
        if (req.reason() == null || req.reason().isBlank()) {
            throw new ApiException("A reason is required for your leave request.", HttpStatus.BAD_REQUEST);
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));

        int days = workingDays(req.startDate(), req.endDate());

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveType(employeeId, req.leaveType())
                .orElseThrow(() -> new ApiException("No leave balance configured for this leave type.", HttpStatus.BAD_REQUEST));

        if (days > balance.getRemainingDays()) {
            throw new ApiException(
                    "This request needs " + days + " day(s), but only " + balance.getRemainingDays()
                            + " day(s) remain for " + label(req.leaveType()) + ".",
                    HttpStatus.BAD_REQUEST);
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(req.leaveType())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .reason(req.reason().trim())
                .status(LeaveStatus.PENDING)
                .build();
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(employee)
                .actorName(employee.getFullName())
                .message("submitted a " + label(req.leaveType()).toLowerCase() + " request for "
                        + req.startDate() + " to " + req.endDate() + ".")
                .kind(ActivityKind.SUBMIT)
                .build());

        return toDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestDto approve(Long requestId, Long reviewerId, String comment) {
        LeaveRequest request = requireReviewable(requestId);
        Employee reviewer = employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found: " + reviewerId));

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveType(request.getEmployee().getId(), request.getLeaveType())
                .orElseThrow(() -> new ApiException("No leave balance configured for this leave type.", HttpStatus.BAD_REQUEST));

        int days = workingDays(request.getStartDate(), request.getEndDate());
        if (days > balance.getRemainingDays()) {
            throw new ApiException("Employee no longer has enough remaining balance to approve this request.", HttpStatus.CONFLICT);
        }
        balance.setUsedDays(balance.getUsedDays() + days);
        leaveBalanceRepository.save(balance);

        request.setStatus(LeaveStatus.APPROVED);
        request.setReviewedBy(reviewer);
        request.setReviewerComment(comment);
        request.setReviewedAt(java.time.LocalDateTime.now());
        leaveRequestRepository.save(request);

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(reviewer)
                .actorName(reviewer.getFullName())
                .message("approved " + request.getEmployee().getFullName() + "'s "
                        + label(request.getLeaveType()).toLowerCase() + " request.")
                .kind(ActivityKind.APPROVE)
                .build());

        return toDto(request);
    }

    @Transactional
    public LeaveRequestDto reject(Long requestId, Long reviewerId, String comment) {
        LeaveRequest request = requireReviewable(requestId);
        Employee reviewer = employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found: " + reviewerId));

        request.setStatus(LeaveStatus.REJECTED);
        request.setReviewedBy(reviewer);
        request.setReviewerComment(comment);
        request.setReviewedAt(java.time.LocalDateTime.now());
        leaveRequestRepository.save(request);

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(reviewer)
                .actorName(reviewer.getFullName())
                .message("rejected " + request.getEmployee().getFullName() + "'s "
                        + label(request.getLeaveType()).toLowerCase() + " request.")
                .kind(ActivityKind.SYSTEM)
                .build());

        return toDto(request);
    }

    private LeaveRequest requireReviewable(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new ApiException("This request has already been reviewed.", HttpStatus.CONFLICT);
        }
        return request;
    }

    public static int workingDays(LocalDate start, LocalDate end) {
        int count = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        return Math.max(count, 1);
    }

    private String label(LeaveType type) {
        return switch (type) {
            case CASUAL -> "Casual Leave";
            case SICK -> "Sick Leave";
            case EARNED -> "Earned Leave";
        };
    }

    LeaveRequestDto toDto(LeaveRequest r) {
        Employee e = r.getEmployee();
        return new LeaveRequestDto(
                r.getId(),
                e.getId(),
                e.getFullName(),
                e.getDesignation(),
                e.getDepartment(),
                r.getLeaveType(),
                r.getStartDate(),
                r.getEndDate(),
                workingDays(r.getStartDate(), r.getEndDate()),
                r.getReason(),
                r.getStatus(),
                r.getReviewedBy() != null ? r.getReviewedBy().getFullName() : null,
                r.getReviewerComment(),
                r.getCreatedAt(),
                r.getReviewedAt());
    }
}
