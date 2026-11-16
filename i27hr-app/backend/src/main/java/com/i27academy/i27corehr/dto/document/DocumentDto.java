package com.i27academy.i27corehr.dto.document;

import java.time.LocalDateTime;

public record DocumentDto(
        Long id,
        Long employeeId,
        String employeeName,
        String documentType,
        String fileName,
        Long fileSize,
        String uploadedBy,
        LocalDateTime uploadedAt,
        String notes) {
}
