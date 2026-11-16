package com.i27academy.i27corehr.dto.auth;

public record LoginResponse(String token, SessionUserDto user) {
}
