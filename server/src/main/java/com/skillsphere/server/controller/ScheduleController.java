package com.skillsphere.server.controller;

import com.skillsphere.server.model.*;
import com.skillsphere.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    @Autowired
    private LiveSessionRepository liveSessionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/schedule
    @GetMapping
    public ResponseEntity<?> getSchedule(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
        List<Course> enrolledCourses = enrollments.stream().map(Enrollment::getCourse).collect(Collectors.toList());

        List<LiveSession> sessions = liveSessionRepository.findByCourseInOrderByStartTimeAsc(enrolledCourses);
        List<Assignment> assignments = assignmentRepository.findByCourseInOrderByDueDateAsc(enrolledCourses);

        List<Map<String, Object>> events = new ArrayList<>();

        for (LiveSession s : sessions) {
            Map<String, Object> ev = new LinkedHashMap<>();
            ev.put("id", "session-" + s.getId());
            ev.put("title", s.getTitle());
            ev.put("courseTitle", s.getCourse().getTitle());
            ev.put("type", "LIVE_SESSION");
            ev.put("datetime", s.getStartTime());
            ev.put("durationMinutes", s.getDurationMinutes());
            ev.put("link", s.getMeetingUrl());
            events.add(ev);
        }

        for (Assignment a : assignments) {
            Map<String, Object> ev = new LinkedHashMap<>();
            ev.put("id", "assignment-" + a.getId());
            ev.put("title", a.getTitle());
            ev.put("courseTitle", a.getCourse().getTitle());
            ev.put("type", "ASSIGNMENT_DUE");
            ev.put("datetime", a.getDueDate());
            ev.put("points", a.getTotalPoints());
            events.add(ev);
        }

        events.sort(Comparator.comparing(a -> a.get("datetime").toString()));

        return ResponseEntity.ok(events);
    }
}
