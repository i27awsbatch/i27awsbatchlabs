package com.i27academy.i27corehr.config;

import com.i27academy.i27corehr.entity.*;
import com.i27academy.i27corehr.repository.EmployeeRepository;
import com.i27academy.i27corehr.repository.LeaveBalanceRepository;
import com.i27academy.i27corehr.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Seeds the three baseline accounts (one HR Admin, one Manager, one Employee) needed to log in
 * and exercise the app after a fresh database init. Only runs when the employees table is empty,
 * so it never touches data created afterwards (seeded or user-created) on later restarts.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedEnabled;
    private final String seedPassword;

    public DataSeeder(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.enabled:true}") boolean seedEnabled,
            @Value("${app.seed.default-password:Passw0rd!}") String seedPassword) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.seedPassword = seedPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Baseline data seeding disabled (app.seed.enabled=false).");
            return;
        }
        if (employeeRepository.count() > 0) {
            log.info("Employees already present — skipping baseline seed.");
            return;
        }

        log.info("Seeding baseline i27CoreHR accounts...");

        employee("i27-0001", "Priya", "Rao", "priya.rao@i27academy.com", "9900000001",
                "Human Resources", "HR Administrator", null, LocalDate.of(2021, 1, 4),
                "Bengaluru, India", Role.HR_ADMIN);

        Employee manager = employee("i27-0002", "Arjun", "Reddy", "arjun.reddy@i27academy.com", "9900000002",
                "Engineering", "Engineering Manager", null, LocalDate.of(2022, 3, 1),
                "Bengaluru, India", Role.MANAGER);

        employee("i27-0003", "Rahul", "Sharma", "rahul.sharma@i27academy.com", "9900000003",
                "Engineering", "Software Engineer", manager, LocalDate.of(2023, 6, 12),
                "Bengaluru, India", Role.EMPLOYEE);

        log.info("Baseline seed complete: {} employees.", employeeRepository.count());
        log.info("Demo login — i27-0001 / priya.rao@i27academy.com (HR Admin), "
                + "i27-0002 / arjun.reddy@i27academy.com (Manager), "
                + "i27-0003 / rahul.sharma@i27academy.com (Employee) — password: {}", seedPassword);
    }

    private Employee employee(
            String employeeCode, String firstName, String lastName, String email, String phone,
            String department, String designation, Employee manager, LocalDate joiningDate, String location,
            Role role) {
        Employee saved = employeeRepository.save(Employee.builder()
                .employeeCode(employeeCode)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone(phone)
                .department(department)
                .designation(designation)
                .manager(manager)
                .joiningDate(joiningDate)
                .location(location)
                .employmentStatus(EmploymentStatus.ACTIVE)
                .build());

        userRepository.save(User.builder()
                .employee(saved)
                .email(email)
                .passwordHash(passwordEncoder.encode(seedPassword))
                .role(role)
                .enabled(true)
                .build());

        for (LeaveType type : LeaveType.values()) {
            leaveBalanceRepository.save(LeaveBalance.builder()
                    .employee(saved)
                    .leaveType(type)
                    .totalDays(defaultAllowance(type))
                    .usedDays(0)
                    .build());
        }

        return saved;
    }

    private int defaultAllowance(LeaveType type) {
        return switch (type) {
            case CASUAL -> 12;
            case SICK -> 8;
            case EARNED -> 4;
        };
    }
}
