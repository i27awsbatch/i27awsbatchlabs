package com.i27academy.i27corehr.service;

import com.i27academy.i27corehr.dto.PageResponse;
import com.i27academy.i27corehr.dto.employee.EmployeeDto;
import com.i27academy.i27corehr.dto.employee.EmployeeUpsertRequest;
import com.i27academy.i27corehr.entity.*;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.exception.ResourceNotFoundException;
import com.i27academy.i27corehr.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultPassword;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            ActivityLogRepository activityLogRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.default-password:Passw0rd!}") String defaultPassword) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultPassword = defaultPassword;
    }

    public PageResponse<EmployeeDto> list(String search, String department, int page, int size, Long scopeManagerId) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        String normalizedDept = (department == null || department.isBlank()) ? "All" : department;

        if (scopeManagerId != null) {
            List<Employee> reports = employeeRepository.findByManagerIdOrderByFirstNameAsc(scopeManagerId);
            List<Employee> filtered = reports.stream()
                    .filter(e -> normalizedDept.equals("All") || e.getDepartment().equals(normalizedDept))
                    .filter(e -> normalizedSearch.isEmpty()
                            || e.getFullName().toLowerCase().contains(normalizedSearch)
                            || e.getEmail().toLowerCase().contains(normalizedSearch))
                    .toList();
            List<EmployeeDto> dtos = filtered.stream().map(this::toDto).toList();
            return new PageResponse<>(dtos, dtos.size(), 0, Math.max(dtos.size(), 1), 1);
        }

        Page<Employee> result = employeeRepository.search(
                normalizedSearch, normalizedDept, PageRequest.of(page, size, Sort.by("firstName")));
        return PageResponse.of(result.map(this::toDto));
    }

    public List<String> departments() {
        return employeeRepository.findDistinctDepartments();
    }

    public EmployeeDto get(Long id) {
        return toDto(findEntity(id));
    }

    Employee findEntity(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    @Transactional
    public EmployeeDto create(EmployeeUpsertRequest req, Employee actor) {
        if (employeeRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ApiException("An employee with this email already exists.", HttpStatus.CONFLICT);
        }

        Employee manager = resolveManager(req.managerId(), null);

        Employee employee = Employee.builder()
                .employeeCode(nextEmployeeCode())
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .email(req.email().trim().toLowerCase())
                .phone(req.phone())
                .department(req.department())
                .designation(req.designation())
                .manager(manager)
                .joiningDate(req.joiningDate())
                .location(req.location())
                .employmentStatus(req.employmentStatus())
                .emergencyContact(req.emergencyContact())
                .build();
        employee = employeeRepository.save(employee);

        User user = User.builder()
                .employee(employee)
                .email(employee.getEmail())
                .passwordHash(passwordEncoder.encode(defaultPassword))
                .role(req.role())
                .enabled(req.employmentStatus() == EmploymentStatus.ACTIVE)
                .build();
        userRepository.save(user);

        for (LeaveType type : LeaveType.values()) {
            leaveBalanceRepository.save(LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .totalDays(defaultAllowance(type))
                    .usedDays(0)
                    .build());
        }

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(actor)
                .actorName(actor.getFullName())
                .message("added " + employee.getFullName() + " to " + employee.getDepartment() + ".")
                .kind(ActivityKind.SYSTEM)
                .build());

        return toDto(employee);
    }

    @Transactional
    public EmployeeDto update(Long id, EmployeeUpsertRequest req, Employee actor) {
        Employee employee = findEntity(id);

        if (!employee.getEmail().equalsIgnoreCase(req.email())
                && employeeRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ApiException("Another employee already uses this email.", HttpStatus.CONFLICT);
        }

        Employee manager = resolveManager(req.managerId(), id);

        employee.setFirstName(req.firstName().trim());
        employee.setLastName(req.lastName().trim());
        employee.setEmail(req.email().trim().toLowerCase());
        employee.setPhone(req.phone());
        employee.setDepartment(req.department());
        employee.setDesignation(req.designation());
        employee.setManager(manager);
        employee.setJoiningDate(req.joiningDate());
        employee.setLocation(req.location());
        employee.setEmploymentStatus(req.employmentStatus());
        employee.setEmergencyContact(req.emergencyContact());
        employee = employeeRepository.save(employee);
        final String updatedEmail = employee.getEmail();

        userRepository.findByEmployeeId(employee.getId()).ifPresent(user -> {
            user.setEmail(updatedEmail);
            user.setRole(req.role());
            user.setEnabled(req.employmentStatus() == EmploymentStatus.ACTIVE);
            userRepository.save(user);
        });

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(actor)
                .actorName(actor.getFullName())
                .message("updated " + employee.getFullName() + "'s record.")
                .kind(ActivityKind.SYSTEM)
                .build());

        return toDto(employee);
    }

    @Transactional
    public EmployeeDto setStatus(Long id, EmploymentStatus status, Employee actor) {
        Employee employee = findEntity(id);
        employee.setEmploymentStatus(status);
        employeeRepository.save(employee);
        userRepository.findByEmployeeId(id).ifPresent(user -> {
            user.setEnabled(status == EmploymentStatus.ACTIVE);
            userRepository.save(user);
        });
        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(actor)
                .actorName(actor.getFullName())
                .message((status == EmploymentStatus.ACTIVE ? "activated " : "deactivated ") + employee.getFullName() + ".")
                .kind(ActivityKind.SYSTEM)
                .build());
        return toDto(employee);
    }

    public long countActive() {
        return employeeRepository.countByEmploymentStatus(EmploymentStatus.ACTIVE);
    }

    public List<EmployeeDto> recentlyAdded(int limit) {
        return employeeRepository.findTop5ByOrderByCreatedAtDesc().stream().limit(limit).map(this::toDto).toList();
    }

    private Employee resolveManager(Long managerId, Long selfId) {
        if (managerId == null) return null;
        if (selfId != null && managerId.equals(selfId)) {
            throw new ApiException("An employee cannot report to themselves.", HttpStatus.BAD_REQUEST);
        }
        return employeeRepository.findById(managerId)
                .orElseThrow(() -> new ApiException("Selected reporting manager was not found.", HttpStatus.BAD_REQUEST));
    }

    private String nextEmployeeCode() {
        long next = employeeRepository.count() + 1;
        return String.format("i27-%04d", next);
    }

    private int defaultAllowance(LeaveType type) {
        return switch (type) {
            case CASUAL -> 12;
            case SICK -> 8;
            case EARNED -> 4;
        };
    }

    EmployeeDto toDto(Employee e) {
        Role role = userRepository.findByEmployeeId(e.getId()).map(User::getRole).orElse(Role.EMPLOYEE);
        return new EmployeeDto(
                e.getId(),
                e.getEmployeeCode(),
                e.getFirstName(),
                e.getLastName(),
                e.getFullName(),
                e.getEmail(),
                e.getPhone(),
                e.getDepartment(),
                e.getDesignation(),
                e.getManager() != null ? e.getManager().getId() : null,
                e.getManager() != null ? e.getManager().getFullName() : null,
                e.getJoiningDate(),
                e.getLocation(),
                e.getEmploymentStatus(),
                e.getProfileImage(),
                role,
                e.getEmergencyContact(),
                e.getUpdatedAt());
    }
}
