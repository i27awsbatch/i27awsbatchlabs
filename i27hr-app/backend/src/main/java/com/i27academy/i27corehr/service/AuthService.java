package com.i27academy.i27corehr.service;

import com.i27academy.i27corehr.dto.auth.LoginResponse;
import com.i27academy.i27corehr.dto.auth.SessionUserDto;
import com.i27academy.i27corehr.entity.Employee;
import com.i27academy.i27corehr.entity.User;
import com.i27academy.i27corehr.repository.ActivityLogRepository;
import com.i27academy.i27corehr.entity.ActivityKind;
import com.i27academy.i27corehr.entity.ActivityLog;
import com.i27academy.i27corehr.repository.UserRepository;
import com.i27academy.i27corehr.security.JwtService;
import com.i27academy.i27corehr.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            ActivityLogRepository activityLogRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public LoginResponse login(String email, String password, boolean remember) {
        UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(email, password);
        var authResult = authenticationManager.authenticate(authRequest);
        UserPrincipal principal = (UserPrincipal) authResult.getPrincipal();
        User user = principal.getUser();

        String token = jwtService.generateToken(
                user.getEmail(), Map.of("role", user.getRole().name(), "uid", user.getId()), remember);

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(user.getEmployee())
                .actorName(displayName(user))
                .message("signed in.")
                .kind(ActivityKind.SYSTEM)
                .build());

        return new LoginResponse(token, toSessionUser(user));
    }

    public SessionUserDto currentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));
        return toSessionUser(user);
    }

    private SessionUserDto toSessionUser(User user) {
        Employee employee = user.getEmployee();
        return new SessionUserDto(
                user.getId(),
                employee != null ? employee.getId() : null,
                employee != null ? employee.getEmployeeCode() : null,
                employee != null ? employee.getFullName() : user.getEmail(),
                user.getEmail(),
                user.getRole(),
                employee != null ? employee.getDesignation() : null,
                employee != null ? employee.getDepartment() : null,
                employee != null && employee.getManager() != null ? employee.getManager().getFullName() : null);
    }

    private String displayName(User user) {
        return user.getEmployee() != null ? user.getEmployee().getFullName() : user.getEmail();
    }
}
