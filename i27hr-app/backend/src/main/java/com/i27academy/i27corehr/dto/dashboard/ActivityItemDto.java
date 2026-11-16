package com.i27academy.i27corehr.dto.dashboard;

import java.time.LocalDateTime;

public record ActivityItemDto(Long id, String actor, String message, String kind, LocalDateTime timestamp) {
}
