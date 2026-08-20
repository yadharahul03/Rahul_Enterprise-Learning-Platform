package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "daily_activity", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "activity_date"}))
@Data
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "units_completed", nullable = false)
    private Integer unitsCompleted = 0;

    @Column(name = "hours_spent", nullable = false)
    private Double hoursSpent = 0.0;
}