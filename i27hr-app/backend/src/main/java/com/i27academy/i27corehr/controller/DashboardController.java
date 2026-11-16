package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.dashboard.DashboardResponseDto;
import com.i27academy.i27corehr.entity.Role;
import com.i27academy.i27corehr.entity.User;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.security.CurrentUser;
import com.i27academy.i27corehr.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUser currentUser;

    public DashboardController(DashboardService dashboardService, CurrentUser currentUser) {
        this.dashboardService = dashboardService;
        this.currentUser = currentUser;
    }

    @GetMapping("/api/dashboard")
    public DashboardResponseDto dashboard() {
        User user = currentUser.get();
        if (user.getRole() == Role.HR_ADMIN) {
            return dashboardService.forHr();
        }
        if (user.getEmployee() == null) {
            throw new ApiException("This account is not linked to an employee record.", HttpStatus.CONFLICT);
        }
        if (user.getRole() == Role.MANAGER) {
            return dashboardService.forManager(user.getEmployee());
        }
        return dashboardService.forEmployee(user.getEmployee());
    }
}
