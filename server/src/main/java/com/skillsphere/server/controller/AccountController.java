package com.skillsphere.server.controller;

import com.skillsphere.server.dto.UpdateProfileRequest;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // GET /api/account/me
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(buildProfileResponse(user));
    }

    // PUT /api/account/update
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setLocation(request.getLocation());
        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference());
        }
        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
        }

        userRepository.save(user);

        return ResponseEntity.ok(buildProfileResponse(user));
    }

    // POST /api/account/change-password  { "currentPassword": "...", "newPassword": "..." }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "This account uses Google sign-in and has no password to change."
            ));
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // -----------------------------------------------------------------
    private Map<String, Object> buildProfileResponse(User user) {
        int coursesEnrolled = enrollmentRepository.findByUser(user).size();
        int coursesCompleted = (int) enrollmentRepository.findByUser(user).stream()
                .filter(e -> e.getUnitsCompleted() >= e.getCourse().getTotalUnits())
                .count();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("dateOfBirth", user.getDateOfBirth());
        profile.put("gender", user.getGender());
        profile.put("location", user.getLocation());
        profile.put("profilePicture", user.getProfilePicture());
        profile.put("themePreference", user.getThemePreference() != null ? user.getThemePreference() : "dark");
        profile.put("emailNotifications", user.getEmailNotifications() != null ? user.getEmailNotifications() : true);
        profile.put("isGoogleAccount", user.getPassword() == null);
        profile.put("memberSince", user.getCreatedAt());
        profile.put("coursesEnrolled", coursesEnrolled);
        profile.put("coursesCompleted", coursesCompleted);
        return profile;
    }
}