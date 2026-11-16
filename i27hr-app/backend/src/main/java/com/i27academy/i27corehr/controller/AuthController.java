package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.auth.LoginRequest;
import com.i27academy.i27corehr.dto.auth.LoginResponse;
import com.i27academy.i27corehr.dto.auth.SessionUserDto;
import com.i27academy.i27corehr.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password(), request.remember());
    }

    @GetMapping("/me")
    public SessionUserDto me(@AuthenticationPrincipal UserDetails principal) {
        return authService.currentUser(principal.getUsername());
    }
}
