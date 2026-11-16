package com.i27academy.i27corehr.repository;

import com.i27academy.i27corehr.entity.LeaveBalance;
import com.i27academy.i27corehr.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByEmployeeIdOrderByLeaveTypeAsc(Long employeeId);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveType);
}
