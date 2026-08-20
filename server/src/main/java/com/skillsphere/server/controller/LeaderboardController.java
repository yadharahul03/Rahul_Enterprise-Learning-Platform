package com.skillsphere.server.controller;

import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.DailyActivityRepository;
import com.skillsphere.server.repository.UserBadgeRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DailyActivityRepository dailyActivityRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    // GET /api/leaderboard?type=all-time|weekly
    @GetMapping
    public ResponseEntity<?> getLeaderboard(@RequestParam(defaultValue = "weekly") String type) {
        List<User> users = userRepository.findAll();

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);

        List<Map<String, Object>> leaderboard = users.stream().map(user -> {
            int badgeCount = userBadgeRepository.findByUser(user).size();

            int unitsCompleted;
            double hoursSpent;

            if ("weekly".equalsIgnoreCase(type)) {
                var activities = dailyActivityRepository.findByUserAndActivityDateAfter(user, sevenDaysAgo);
                unitsCompleted = activities.stream().mapToInt(a -> a.getUnitsCompleted() != null ? a.getUnitsCompleted() : 0).sum();
                hoursSpent = activities.stream().mapToDouble(a -> a.getHoursSpent() != null ? a.getHoursSpent() : 0.0).sum();
            } else {
                var activities = dailyActivityRepository.findByUser(user);
                unitsCompleted = activities.stream().mapToInt(a -> a.getUnitsCompleted() != null ? a.getUnitsCompleted() : 0).sum();
                hoursSpent = activities.stream().mapToDouble(a -> a.getHoursSpent() != null ? a.getHoursSpent() : 0.0).sum();
            }

            // XP formula: (unitsCompleted * 50) + (badgeCount * 150) + (int)(hoursSpent * 20)
            int score = (unitsCompleted * 50) + (badgeCount * 150) + (int) Math.round(hoursSpent * 20.0);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("userId", user.getId());
            entry.put("name", user.getName());
            entry.put("role", user.getRole());
            entry.put("profilePicture", user.getProfilePicture());
            entry.put("unitsCompleted", unitsCompleted);
            entry.put("hoursSpent", hoursSpent);
            entry.put("badgeCount", badgeCount);
            entry.put("score", score);
            return entry;
        })
        .sorted((a, b) -> Integer.compare((Integer) b.get("score"), (Integer) a.get("score")))
        .collect(Collectors.toList());

        // Assign ranks 1..N
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("rank", i + 1);
        }

        return ResponseEntity.ok(leaderboard);
    }
}
