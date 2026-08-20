package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lessons")
@Data
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonType type; // VIDEO, READING, or QUIZ

    @Column(name = "video_url")
    private String videoUrl; // used when type = VIDEO

    @Column(columnDefinition = "TEXT")
    private String content; // used when type = READING
}