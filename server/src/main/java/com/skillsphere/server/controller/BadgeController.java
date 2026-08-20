package com.skillsphere.server.controller;

import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.BadgeDTO;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-badges")
    public ResponseEntity<ApiResponse<List<BadgeDTO>>> getMyBadges(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        badgeService.checkAndAwardBadges(user);
        List<BadgeDTO> badges = badgeService.getUserBadges(user);
        return ResponseEntity.ok(ApiResponse.success("Badges retrieved successfully", badges));
    }
}
