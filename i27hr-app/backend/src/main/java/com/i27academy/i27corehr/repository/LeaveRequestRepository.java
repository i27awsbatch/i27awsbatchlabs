package com.i27academy.i27corehr.repository;

import com.i27academy.i27corehr.entity.LeaveRequest;
import com.i27academy.i27corehr.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<LeaveRequest> findByEmployeeIdInOrderByCreatedAtDesc(List<Long> employeeIds);

    List<LeaveRequest> findByEmployeeIdInAndStatusOrderByCreatedAtDesc(List<Long> employeeIds, LeaveStatus status);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);

    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(LeaveStatus status);

    long countByEmployeeIdInAndStatus(List<Long> employeeIds, LeaveStatus status);

    List<LeaveRequest> findTop5ByOrderByCreatedAtDesc();

    List<LeaveRequest> findByEmployeeIdInAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            List<Long> employeeIds, LeaveStatus status, LocalDate before, LocalDate after);

    List<LeaveRequest> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LeaveStatus status, LocalDate before, LocalDate after);

    long countByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LeaveStatus status, LocalDate before, LocalDate after);
}
