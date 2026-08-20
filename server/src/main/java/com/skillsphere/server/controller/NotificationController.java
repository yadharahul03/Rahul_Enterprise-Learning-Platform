package com.skillsphere.server.controller;

import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.NotificationDTO;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationDTO> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Map<String, String>>> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", Map.of("message", "Marked as read")));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, String>>> markAllAsRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", Map.of("message", "All marked as read")));
    }
}
