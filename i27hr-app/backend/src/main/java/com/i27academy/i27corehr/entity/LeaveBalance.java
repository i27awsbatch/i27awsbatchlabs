package com.i27academy.i27corehr.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leave_balances", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "leave_type"}))
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(name = "used_days", nullable = false)
    private Integer usedDays = 0;

    public LeaveBalance() {
    }

    public Integer getRemainingDays() {
        return totalDays - usedDays;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public Integer getUsedDays() {
        return usedDays;
    }

    public void setUsedDays(Integer usedDays) {
        this.usedDays = usedDays;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private final LeaveBalance target = new LeaveBalance();

        public Builder employee(Employee v) {
            target.employee = v;
            return this;
        }

        public Builder leaveType(LeaveType v) {
            target.leaveType = v;
            return this;
        }

        public Builder totalDays(Integer v) {
            target.totalDays = v;
            return this;
        }

        public Builder usedDays(Integer v) {
            target.usedDays = v;
            return this;
        }

        public LeaveBalance build() {
            return target;
        }
    }
}
