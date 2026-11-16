package com.i27academy.i27corehr.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_log")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_employee_id")
    private Employee actorEmployee;

    @Column(name = "actor_name", nullable = false, length = 150)
    private String actorName;

    @Column(nullable = false, length = 400)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityKind kind;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ActivityLog() {
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

    public Employee getActorEmployee() {
        return actorEmployee;
    }

    public void setActorEmployee(Employee actorEmployee) {
        this.actorEmployee = actorEmployee;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ActivityKind getKind() {
        return kind;
    }

    public void setKind(ActivityKind kind) {
        this.kind = kind;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private final ActivityLog target = new ActivityLog();

        public Builder actorEmployee(Employee v) {
            target.actorEmployee = v;
            return this;
        }

        public Builder actorName(String v) {
            target.actorName = v;
            return this;
        }

        public Builder message(String v) {
            target.message = v;
            return this;
        }

        public Builder kind(ActivityKind v) {
            target.kind = v;
            return this;
        }

        public ActivityLog build() {
            return target;
        }
    }
}
