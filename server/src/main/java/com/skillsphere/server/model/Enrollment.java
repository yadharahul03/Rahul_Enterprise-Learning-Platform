package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "units_completed", nullable = false)
    private Integer unitsCompleted = 0;

    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    // Prevents sending the "you finished the course" email more than once.
    @Column(name = "certificate_emailed", columnDefinition = "boolean default false")
    private Boolean certificateEmailed = false;
}