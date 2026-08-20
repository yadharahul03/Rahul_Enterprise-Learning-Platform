package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_number", nullable = false, unique = true)
    private String certificateNumber; // e.g. SS-CERT-2026-X892A0

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate;

    @Builder.Default
    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 100;

    @PrePersist
    public void prePersist() {
        if (issueDate == null) {
            issueDate = LocalDateTime.now();
        }
        if (completionPercentage == null) {
            completionPercentage = 100;
        }
    }
}
