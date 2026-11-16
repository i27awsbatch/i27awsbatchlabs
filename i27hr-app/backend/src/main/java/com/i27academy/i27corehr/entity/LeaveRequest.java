package com.i27academy.i27corehr.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 600)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveStatus status = LeaveStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Employee reviewedBy;

    @Column(name = "reviewer_comment", length = 600)
    private String reviewerComment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public LeaveRequest() {
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public Employee getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Employee reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getReviewerComment() {
        return reviewerComment;
    }

    public void setReviewerComment(String reviewerComment) {
        this.reviewerComment = reviewerComment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public static LeaveRequestBuilder builder() {
        return new LeaveRequestBuilder();
    }

    public static final class LeaveRequestBuilder {
        private final LeaveRequest target = new LeaveRequest();

        public LeaveRequestBuilder employee(Employee v) {
            target.employee = v;
            return this;
        }

        public LeaveRequestBuilder leaveType(LeaveType v) {
            target.leaveType = v;
            return this;
        }

        public LeaveRequestBuilder startDate(LocalDate v) {
            target.startDate = v;
            return this;
        }

        public LeaveRequestBuilder endDate(LocalDate v) {
            target.endDate = v;
            return this;
        }

        public LeaveRequestBuilder reason(String v) {
            target.reason = v;
            return this;
        }

        public LeaveRequestBuilder status(LeaveStatus v) {
            target.status = v;
            return this;
        }

        public LeaveRequestBuilder reviewedBy(Employee v) {
            target.reviewedBy = v;
            return this;
        }

        public LeaveRequestBuilder reviewerComment(String v) {
            target.reviewerComment = v;
            return this;
        }

        public LeaveRequestBuilder reviewedAt(LocalDateTime v) {
            target.reviewedAt = v;
            return this;
        }

        public LeaveRequest build() {
            return target;
        }
    }
}
