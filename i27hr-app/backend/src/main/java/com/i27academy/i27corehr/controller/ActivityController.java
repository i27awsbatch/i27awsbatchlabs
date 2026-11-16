package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.dashboard.ActivityItemDto;
import com.i27academy.i27corehr.entity.ActivityLog;
import com.i27academy.i27corehr.repository.ActivityLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('HR_ADMIN','MANAGER')")
public class ActivityController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping("/api/activity")
    public List<ActivityItemDto> recent(@RequestParam(defaultValue = "20") int limit) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100))).stream()
                .map(this::toDto)
                .toList();
    }

    private ActivityItemDto toDto(ActivityLog log) {
        String kind = switch (log.getKind()) {
            case APPROVE -> "approve";
            case SUBMIT -> "submit";
            case SYSTEM -> "system";
        };
        return new ActivityItemDto(log.getId(), log.getActorName(), log.getMessage(), kind, log.getCreatedAt());
    }
}
