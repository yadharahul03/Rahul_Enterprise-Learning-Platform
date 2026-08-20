package com.skillsphere.server.controller;

import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getSummary(user));
    }

    @GetMapping("/enrollments")
    public ResponseEntity<?> getEnrollments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getEnrollments(user));
    }

    // POST /api/dashboard/enrollments/{enrollmentId}/progress
    // Logs one unit of progress on a course, called by the "Resume trail" button.
    @PostMapping("/enrollments/{enrollmentId}/progress")
    public ResponseEntity<?> addProgress(@PathVariable Long enrollmentId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.addProgress(user, enrollmentId, 1));
    }

    // DEV-ONLY: populates sample courses/enrollments/activity for the logged-in
    // user so the dashboard has real data before the course catalog and
    // enrollment flow are built. Remove or protect this before production.
    @PostMapping("/seed-demo-data")
    public ResponseEntity<?> seedDemoData(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        dashboardService.seedDemoData(user);
        return ResponseEntity.ok(Map.of("message", "Demo data seeded for " + user.getEmail()));
    }
}