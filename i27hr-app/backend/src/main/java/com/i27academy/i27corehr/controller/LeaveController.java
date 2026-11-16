package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.leave.LeaveApplyRequest;
import com.i27academy.i27corehr.dto.leave.LeaveBalanceDto;
import com.i27academy.i27corehr.dto.leave.LeaveRequestDto;
import com.i27academy.i27corehr.dto.leave.LeaveReviewRequest;
import com.i27academy.i27corehr.entity.LeaveStatus;
import com.i27academy.i27corehr.entity.Role;
import com.i27academy.i27corehr.entity.User;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.security.CurrentUser;
import com.i27academy.i27corehr.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;
    private final CurrentUser currentUser;

    public LeaveController(LeaveService leaveService, CurrentUser currentUser) {
        this.leaveService = leaveService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<LeaveRequestDto> list(
            @RequestParam(defaultValue = "mine") String scope,
            @RequestParam(required = false) LeaveStatus status) {
        User me = currentUser.get();
        Long employeeId = requireEmployeeId(me);

        return switch (scope) {
            case "team" -> {
                if (me.getRole() != Role.MANAGER && me.getRole() != Role.HR_ADMIN) {
                    throw new ApiException("Only managers can view team requests.", HttpStatus.FORBIDDEN);
                }
                yield leaveService.team(employeeId, status);
            }
            case "all" -> {
                if (me.getRole() != Role.HR_ADMIN) {
                    throw new ApiException("Only HR can view all leave requests.", HttpStatus.FORBIDDEN);
                }
                yield leaveService.all(status);
            }
            default -> leaveService.mine(employeeId);
        };
    }

    @GetMapping("/balances")
    public List<LeaveBalanceDto> myBalances() {
        return leaveService.balances(requireEmployeeId(currentUser.get()));
    }

    @GetMapping("/balances/{employeeId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
    public List<LeaveBalanceDto> balances(@PathVariable Long employeeId) {
        return leaveService.balances(employeeId);
    }

    @PostMapping
    public LeaveRequestDto apply(@Valid @RequestBody LeaveApplyRequest request) {
        return leaveService.apply(requireEmployeeId(currentUser.get()), request);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
    public LeaveRequestDto approve(@PathVariable Long id, @RequestBody(required = false) LeaveReviewRequest request) {
        String comment = request != null ? request.comment() : null;
        return leaveService.approve(id, requireEmployeeId(currentUser.get()), comment);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
    public LeaveRequestDto reject(@PathVariable Long id, @RequestBody(required = false) LeaveReviewRequest request) {
        String comment = request != null ? request.comment() : null;
        return leaveService.reject(id, requireEmployeeId(currentUser.get()), comment);
    }

    private Long requireEmployeeId(User user) {
        if (user.getEmployee() == null) {
            throw new ApiException("This account is not linked to an employee record.", HttpStatus.CONFLICT);
        }
        return user.getEmployee().getId();
    }
}
