package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.PageResponse;
import com.i27academy.i27corehr.dto.employee.EmployeeDto;
import com.i27academy.i27corehr.dto.employee.EmployeeStatusRequest;
import com.i27academy.i27corehr.dto.employee.EmployeeUpsertRequest;
import com.i27academy.i27corehr.entity.Employee;
import com.i27academy.i27corehr.entity.Role;
import com.i27academy.i27corehr.entity.User;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.security.CurrentUser;
import com.i27academy.i27corehr.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CurrentUser currentUser;

    public EmployeeController(EmployeeService employeeService, CurrentUser currentUser) {
        this.employeeService = employeeService;
        this.currentUser = currentUser;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
    public PageResponse<EmployeeDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User me = currentUser.get();
        Long scopeManagerId = me.getRole() == Role.MANAGER && me.getEmployee() != null
                ? me.getEmployee().getId()
                : null;
        return employeeService.list(search, department, page, size, scopeManagerId);
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
    public List<String> departments() {
        return employeeService.departments();
    }

    @GetMapping("/{id}")
    public EmployeeDto get(@PathVariable Long id) {
        User me = currentUser.get();
        boolean isSelf = me.getEmployee() != null && me.getEmployee().getId().equals(id);
        if (me.getRole() != Role.HR_ADMIN && me.getRole() != Role.MANAGER && !isSelf) {
            throw new ApiException("You can only view your own employee record.", HttpStatus.FORBIDDEN);
        }
        return employeeService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public EmployeeDto create(@Valid @RequestBody EmployeeUpsertRequest request) {
        return employeeService.create(request, actorEmployee());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public EmployeeDto update(@PathVariable Long id, @Valid @RequestBody EmployeeUpsertRequest request) {
        return employeeService.update(id, request, actorEmployee());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public EmployeeDto setStatus(@PathVariable Long id, @Valid @RequestBody EmployeeStatusRequest request) {
        return employeeService.setStatus(id, request.employmentStatus(), actorEmployee());
    }

    private Employee actorEmployee() {
        User user = currentUser.get();
        if (user.getEmployee() == null) {
            throw new ApiException("This account is not linked to an employee record.", HttpStatus.CONFLICT);
        }
        return user.getEmployee();
    }
}
