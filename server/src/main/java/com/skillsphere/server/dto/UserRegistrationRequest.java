package com.skillsphere.server.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String role; // STUDENT, INSTRUCTOR, ADMIN
    private String adminSecretKey; // Optional secret key required if role is ADMIN
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String location;
}
