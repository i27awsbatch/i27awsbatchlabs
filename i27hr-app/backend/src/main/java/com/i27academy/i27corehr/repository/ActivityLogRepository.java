package com.i27academy.i27corehr.repository;

import com.i27academy.i27corehr.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ActivityLog> findByActorEmployeeIdInOrderByCreatedAtDesc(List<Long> actorEmployeeIds, Pageable pageable);
}
