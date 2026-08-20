package com.skillsphere.server.controller;

import com.skillsphere.server.model.Announcement;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.AnnouncementRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Student-facing read of announcements posted by instructors — scoped to
// whatever courses the logged-in user is actually enrolled in.
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> myAnnouncements(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Course> enrolledCourses = enrollmentRepository.findByUser(user).stream()
                .map(e -> e.getCourse())
                .collect(Collectors.toList());

        List<Announcement> announcements = enrolledCourses.isEmpty()
                ? List.of()
                : announcementRepository.findByCourseInOrderByCreatedAtDesc(enrolledCourses);

        List<Map<String, Object>> result = announcements.stream()
                .limit(20)
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("courseTitle", a.getCourse().getTitle());
                    m.put("message", a.getMessage());
                    m.put("createdAt", a.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
