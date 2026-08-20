package com.skillsphere.server.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String provider;
    private String providerId;
    private Boolean active;
    private String profilePicture;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private Boolean isGoogleAccount;
    private String themePreference;
    private Boolean emailNotifications;
}
