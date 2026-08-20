package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Builder.Default
    @Column(columnDefinition = "varchar(20) default 'BEGINNER'")
    private String difficulty = "BEGINNER"; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "total_units", nullable = false)
    private Integer totalUnits;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private Boolean published = true;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;
}
