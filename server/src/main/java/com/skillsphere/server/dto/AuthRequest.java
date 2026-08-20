package com.skillsphere.server.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AuthRequest {
    private String name;
    private String email;
    private String password;

    // Personal details, collected at signup (optional on login requests)
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String location;

    // "STUDENT" or "INSTRUCTOR", set at signup. Optional — defaults to STUDENT
    // server-side if omitted or invalid.
    private String role;
}