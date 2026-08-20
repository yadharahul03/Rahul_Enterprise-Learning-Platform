package com.skillsphere.server.controller;

import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.CourseDTO;
import com.skillsphere.server.dto.PageResponse;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/courses — catalog list for logged in user (backward compatible + DTO enriched)
    @GetMapping
    public ResponseEntity<?> listCourses(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<CourseDTO> courses = courseService.getAllCoursesForUser(user);
        return ResponseEntity.ok(courses);
    }

    // GET /api/courses/search — Paginated search, filter by keyword, category, difficulty
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<CourseDTO>>> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir,
            Authentication authentication) {

        User user = getUserFromAuth(authentication);
        PageResponse<CourseDTO> pageResult = courseService.searchCourses(keyword, category, difficulty, page, size, sortBy, sortDir, user);
        return ResponseEntity.ok(ApiResponse.success(pageResult));
    }

    // GET /api/courses/{courseId} — Single course detail view DTO
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDTO>> getCourseById(@PathVariable Long courseId, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        CourseDTO course = courseService.getCourseById(courseId, user);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    // POST /api/courses/{courseId}/enroll — Enrolls the logged-in user in a course
    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<ApiResponse<Map<String, String>>> enroll(@PathVariable Long courseId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyEnrolled = enrollmentRepository.findByUser(user).stream()
                .anyMatch(e -> e.getCourse().getId().equals(courseId));
        if (alreadyEnrolled) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Already enrolled in this course"));
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (course.getPublished() != null && !course.getPublished()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("This course isn't published yet"));
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setUnitsCompleted(0);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setLastAccessed(LocalDateTime.now());
        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok(ApiResponse.success("Enrolled in " + course.getTitle(), Map.of("message", "Enrolled in " + course.getTitle())));
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
}