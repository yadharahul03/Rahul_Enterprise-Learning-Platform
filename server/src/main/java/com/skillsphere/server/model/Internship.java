package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String type; // REMOTE, HYBRID, ONSITE

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "apply_url", nullable = false)
    private String applyUrl;

    @Column(name = "posted_at", nullable = false)
    private LocalDateTime postedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @PrePersist
    public void prePersist() {
        if (postedAt == null) {
            postedAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
    }
}
