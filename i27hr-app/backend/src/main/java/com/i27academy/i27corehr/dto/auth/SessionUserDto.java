package com.i27academy.i27corehr.dto.auth;

import com.i27academy.i27corehr.entity.Role;

public record SessionUserDto(
        Long id,
        Long employeeId,
        String employeeCode,
        String fullName,
        String email,
        Role role,
        String designation,
        String department,
        String managerName) {
}
