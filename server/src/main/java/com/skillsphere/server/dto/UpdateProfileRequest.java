package com.skillsphere.server.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String location;
    private String themePreference;
    private Boolean emailNotifications;
}