package com.skillsphere.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(nullable = true)
    private String password;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "varchar(20) default 'STUDENT'")
    private String role = "STUDENT";

    @Builder.Default
    @Column(nullable = false, columnDefinition = "varchar(20) default 'LOCAL'")
    private String provider = "LOCAL";

    @Column(name = "provider_id")
    private String providerId;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    private String location;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "theme_preference")
    private String themePreference;

    @Column(name = "email_notifications")
    private Boolean emailNotifications;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
        if (role == null) {
            role = "STUDENT";
        }
        if (provider == null) {
            provider = "LOCAL";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}