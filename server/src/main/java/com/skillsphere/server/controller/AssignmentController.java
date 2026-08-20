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
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/assignments - Get assignments for user's enrolled courses (or all courses for instructors/admins)
    @GetMapping
    public ResponseEntity<?> getAssignments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Assignment> assignments;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            assignments = assignmentRepository.findAllByOrderByDueDateAsc();
        } else if ("INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            List<Course> ownCourses = courseRepository.findByInstructor(user);
            assignments = assignmentRepository.findByCourseInOrderByDueDateAsc(ownCourses);
        } else {
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            List<Course> enrolledCourses = enrollments.stream().map(Enrollment::getCourse).collect(Collectors.toList());
            assignments = assignmentRepository.findByCourseInOrderByDueDateAsc(enrolledCourses);
        }

        List<Map<String, Object>> response = assignments.stream().map(asgn -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", asgn.getId());
            map.put("courseId", asgn.getCourse().getId());
            map.put("courseTitle", asgn.getCourse().getTitle());
            map.put("title", asgn.getTitle());
            map.put("description", asgn.getDescription());
            map.put("dueDate", asgn.getDueDate());
            map.put("totalPoints", asgn.getTotalPoints());

            Optional<AssignmentSubmission> subOpt = submissionRepository.findByAssignmentAndStudent(asgn, user);
            if (subOpt.isPresent()) {
                AssignmentSubmission sub = subOpt.get();
                map.put("submissionStatus", "SUBMITTED");
                map.put("submissionText", sub.getSubmissionText());
                map.put("fileUrl", sub.getFileUrl());
                map.put("submittedAt", sub.getSubmittedAt());
                map.put("score", sub.getScore());
                map.put("feedback", sub.getFeedback());
            } else {
                map.put("submissionStatus", "PENDING");
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // POST /api/assignments - Instructor creates assignment
    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody Map<String, Object> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"INSTRUCTOR".equalsIgnoreCase(user.getRole()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only instructors can create assignments"));
        }

        Long courseId = Long.valueOf(body.get("courseId").toString());
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if ("INSTRUCTOR".equalsIgnoreCase(user.getRole()) && (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this course"));
        }

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String dueDateStr = (String) body.get("dueDate");
        Integer totalPoints = body.get("totalPoints") != null ? Integer.valueOf(body.get("totalPoints").toString()) : 100;

        if (title == null || title.isBlank() || description == null || description.isBlank() || dueDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, description, and dueDate are required"));
        }

        LocalDateTime dueDate = LocalDateTime.parse(dueDateStr);

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .totalPoints(totalPoints)
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.ok(Map.of("message", "Assignment created successfully", "id", saved.getId()));
    }

    // POST /api/assignments/{assignmentId}/submit - Student submits assignment
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId, @RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        String submissionText = body.get("submissionText");
        String fileUrl = body.get("fileUrl");

        if ((submissionText == null || submissionText.isBlank()) && (fileUrl == null || fileUrl.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please provide submission text or file URL"));
        }

        AssignmentSubmission submission = submissionRepository.findByAssignmentAndStudent(assignment, user)
                .orElse(AssignmentSubmission.builder().assignment(assignment).student(user).build());

        submission.setSubmissionText(submissionText);
        submission.setFileUrl(fileUrl);
        submission.setSubmittedAt(LocalDateTime.now());

        submissionRepository.save(submission);
        return ResponseEntity.ok(Map.of("message", "Assignment submitted successfully"));
    }

    // POST /api/assignments/submissions/{submissionId}/grade - Instructor grades submission
    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long submissionId, @RequestBody Map<String, Object> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Course course = submission.getAssignment().getCourse();
        if ("INSTRUCTOR".equalsIgnoreCase(user.getRole()) && (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this course"));
        }

        Integer score = Integer.valueOf(body.get("score").toString());
        String feedback = (String) body.get("feedback");

        submission.setScore(score);
        submission.setFeedback(feedback);
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of("message", "Submission graded successfully"));
    }
}
