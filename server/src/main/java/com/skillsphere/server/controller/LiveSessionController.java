package com.skillsphere.server.controller;

import com.skillsphere.server.model.*;
import com.skillsphere.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
public class LiveSessionController {

    @Autowired
    private LiveSessionRepository liveSessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/sessions - Get live sessions for enrolled courses (or all for Admin/Instructor)
    @GetMapping
    public ResponseEntity<?> getLiveSessions(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LiveSession> sessions;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            sessions = liveSessionRepository.findAllByOrderByStartTimeAsc();
        } else if ("INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            List<Course> ownCourses = courseRepository.findByInstructor(user);
            sessions = liveSessionRepository.findByCourseInOrderByStartTimeAsc(ownCourses);
        } else {
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            List<Course> enrolledCourses = enrollments.stream().map(Enrollment::getCourse).collect(Collectors.toList());
            sessions = liveSessionRepository.findByCourseInOrderByStartTimeAsc(enrolledCourses);
        }

        List<Map<String, Object>> response = sessions.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("courseId", s.getCourse().getId());
            map.put("courseTitle", s.getCourse().getTitle());
            map.put("title", s.getTitle());
            map.put("description", s.getDescription());
            map.put("startTime", s.getStartTime());
            map.put("durationMinutes", s.getDurationMinutes());
            map.put("meetingUrl", s.getMeetingUrl());
            map.put("instructorName", s.getCourse().getInstructor() != null ? s.getCourse().getInstructor().getName() : "Instructor");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // POST /api/sessions - Instructor schedules a live session
    @PostMapping
    public ResponseEntity<?> scheduleLiveSession(@RequestBody Map<String, Object> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"INSTRUCTOR".equalsIgnoreCase(user.getRole()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only instructors can schedule live sessions"));
        }

        Long courseId = Long.valueOf(body.get("courseId").toString());
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if ("INSTRUCTOR".equalsIgnoreCase(user.getRole()) && (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this course"));
        }

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String startTimeStr = (String) body.get("startTime");
        Integer durationMinutes = body.get("durationMinutes") != null ? Integer.valueOf(body.get("durationMinutes").toString()) : 60;
        String meetingUrl = (String) body.get("meetingUrl");

        if (title == null || startTimeStr == null || meetingUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, startTime, and meetingUrl are required"));
        }

        LocalDateTime startTime = LocalDateTime.parse(startTimeStr);

        LiveSession session = LiveSession.builder()
                .course(course)
                .title(title)
                .description(description)
                .startTime(startTime)
                .durationMinutes(durationMinutes)
                .meetingUrl(meetingUrl)
                .build();

        LiveSession saved = liveSessionRepository.save(session);
        return ResponseEntity.ok(Map.of("message", "Live session scheduled successfully", "id", saved.getId()));
    }
}
