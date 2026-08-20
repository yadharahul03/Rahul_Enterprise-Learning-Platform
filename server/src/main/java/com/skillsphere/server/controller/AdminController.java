package com.skillsphere.server.controller;

import com.skillsphere.server.config.ReminderScheduler;
import com.skillsphere.server.dto.AdminDashboardDTO;
import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.UserResponseDTO;
import com.skillsphere.server.service.AdminService;
import com.skillsphere.server.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ReminderScheduler reminderScheduler;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getAdminDashboard() {
        AdminDashboardDTO dashboard = adminService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard fetched", dashboard));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
        List<UserResponseDTO> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{userId}/toggle-active")
    public ResponseEntity<ApiResponse<UserResponseDTO>> toggleUserActiveStatus(@PathVariable Long userId) {
        UserResponseDTO updatedUser = adminService.toggleUserActiveStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updatedUser));
    }

    // Instant Test Endpoint: Trigger Reminder Scheduler
    @PostMapping("/trigger-reminders")
    public ResponseEntity<ApiResponse<Map<String, String>>> triggerReminderScheduler() {
        reminderScheduler.processStudyReminders();
        return ResponseEntity.ok(ApiResponse.success("Study reminder scheduler executed successfully. Checked enrollments and sent emails/notifications.", Map.of("status", "SUCCESS")));
    }

    // Instant Test Endpoint: Send Sample Email to Current Admin
    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendTestEmail(Authentication authentication) {
        String adminEmail = authentication.getName();
        emailService.sendLearningReminderEmail(adminEmail, "Enterprise Learning Admin", "Spring Boot 3 REST API Production Development");
        return ResponseEntity.ok(ApiResponse.success("Test learning reminder email dispatched to " + adminEmail, Map.of("recipient", adminEmail)));
    }
}
