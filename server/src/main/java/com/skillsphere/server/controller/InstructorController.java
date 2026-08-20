package com.skillsphere.server.controller;

import com.skillsphere.server.model.Announcement;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.Lesson;
import com.skillsphere.server.model.LessonType;
import com.skillsphere.server.model.QuizQuestion;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.AnnouncementRepository;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.LessonProgressRepository;
import com.skillsphere.server.repository.LessonRepository;
import com.skillsphere.server.repository.QuizQuestionRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Everything here is gated on User.role == "INSTRUCTOR". There's no
// Spring Security method-level role checking wired up in this project
// (JwtAuthenticationFilter grants an authority-less Authentication), so
// the check is done manually at the top of each method instead of via
// @PreAuthorize. That's consistent with how the rest of this codebase
// authorizes per-user data access (see CourseController.enroll, which
// checks ownership manually too).
@RestController
@RequestMapping("/api/instructor")
public class InstructorController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    private User requireInstructor(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"INSTRUCTOR".equals(user.getRole())) {
            throw new AccessDeniedRuntimeException();
        }
        return user;
    }

    // Thin marker so the exception handler below can tell "not an
    // instructor" apart from a genuine 500.
    static class AccessDeniedRuntimeException extends RuntimeException {}

    @ExceptionHandler(AccessDeniedRuntimeException.class)
    public ResponseEntity<?> handleAccessDenied() {
        return ResponseEntity.status(403).body(Map.of("error", "Instructor access required"));
    }

    // GET /api/instructor/overview — summary stats for the instructor dashboard
    @GetMapping("/overview")
    public ResponseEntity<?> overview(Authentication authentication) {
        User instructor = requireInstructor(authentication);
        List<Course> myCourses = courseRepository.findByInstructor(instructor);

        int totalStudents = 0;
        double totalPercent = 0;
        int enrollmentCount = 0;

        for (Course c : myCourses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourse(c);
            totalStudents += enrollments.size();
            for (Enrollment e : enrollments) {
                totalPercent += (100.0 * e.getUnitsCompleted() / Math.max(1, c.getTotalUnits()));
                enrollmentCount++;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCourses", myCourses.size());
        result.put("totalStudents", totalStudents);
        result.put("avgCompletion", enrollmentCount == 0 ? 0 : Math.round(totalPercent / enrollmentCount));
        return ResponseEntity.ok(result);
    }

    // GET /api/instructor/courses — courses owned by the logged-in instructor
    @GetMapping("/courses")
    public ResponseEntity<?> myCourses(Authentication authentication) {
        User instructor = requireInstructor(authentication);
        List<Map<String, Object>> result = courseRepository.findByInstructor(instructor).stream()
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("title", c.getTitle());
                    m.put("category", c.getCategory());
                    m.put("totalUnits", c.getTotalUnits());
                    m.put("description", c.getDescription());
                    m.put("published", c.getPublished() == null || c.getPublished());
                    m.put("studentCount", enrollmentRepository.findByCourse(c).size());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // POST /api/instructor/courses  { "title": "...", "category": "...", "totalUnits": 10 }
    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);

        String title = String.valueOf(body.get("title"));
        String category = String.valueOf(body.get("category"));
        Integer totalUnits;
        try {
            totalUnits = Integer.parseInt(String.valueOf(body.get("totalUnits")));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "totalUnits must be a number"));
        }

        if (title == null || title.isBlank() || "null".equals(title)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }
        if (totalUnits == null || totalUnits < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course needs at least 1 unit"));
        }

        Course course = new Course();
        course.setTitle(title);
        course.setCategory(category == null || "null".equals(category) ? "General" : category);
        course.setTotalUnits(totalUnits);
        course.setDescription(body.get("description") == null ? null : String.valueOf(body.get("description")));
        course.setPublished(true);
        course.setInstructor(instructor);
        courseRepository.save(course);

        return ResponseEntity.ok(course);
    }

    // PUT /api/instructor/courses/{id}
    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = courseRepository.findById(id).orElse(null);

        if (course == null || course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        if (body.get("title") != null) course.setTitle(String.valueOf(body.get("title")));
        if (body.get("category") != null) course.setCategory(String.valueOf(body.get("category")));
        if (body.get("description") != null) course.setDescription(String.valueOf(body.get("description")));
        if (body.get("published") != null) course.setPublished(Boolean.parseBoolean(String.valueOf(body.get("published"))));
        if (body.get("totalUnits") != null) {
            try {
                course.setTotalUnits(Integer.parseInt(String.valueOf(body.get("totalUnits"))));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "totalUnits must be a number"));
            }
        }
        courseRepository.save(course);
        return ResponseEntity.ok(course);
    }

    // DELETE /api/instructor/courses/{id} — blocked if students are already enrolled,
    // to avoid silently orphaning their progress data.
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = courseRepository.findById(id).orElse(null);

        if (course == null || course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        if (!enrollments.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Can't delete a course with " + enrollments.size() + " enrolled student(s)."
            ));
        }

        courseRepository.delete(course);
        return ResponseEntity.ok(Map.of("message", "Course deleted"));
    }

    // GET /api/instructor/courses/{id}/students — roster with per-student progress
    @GetMapping("/courses/{id}/students")
    public ResponseEntity<?> courseStudents(@PathVariable Long id, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = courseRepository.findById(id).orElse(null);

        if (course == null || course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        List<Map<String, Object>> roster = enrollmentRepository.findByCourse(course).stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getUser().getName());
                    m.put("email", e.getUser().getEmail());
                    m.put("unitsCompleted", e.getUnitsCompleted());
                    m.put("totalUnits", course.getTotalUnits());
                    m.put("percentComplete", Math.round(100.0 * e.getUnitsCompleted() / Math.max(1, course.getTotalUnits())));
                    m.put("lastAccessed", e.getLastAccessed());
                    m.put("enrolledAt", e.getEnrolledAt());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> courseInfo = new LinkedHashMap<>();
        courseInfo.put("id", course.getId());
        courseInfo.put("title", course.getTitle());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("course", courseInfo);
        result.put("students", roster);
        return ResponseEntity.ok(result);
    }

    // -----------------------------------------------------------------
    // Lesson management — instructor must own the course the lesson
    // belongs to (or, for creation, the course they're adding to).
    // -----------------------------------------------------------------

    private Course requireOwnedCourse(Long courseId, User instructor) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null || course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            return null;
        }
        return course;
    }

    // Keeps Course.totalUnits truthful — it should always reflect how many
    // lessons actually exist, since student progress % is computed against it.
    private void syncTotalUnits(Course course) {
        int count = lessonRepository.findByCourseOrderByOrderIndexAsc(course).size();
        course.setTotalUnits(Math.max(count, 1));
        courseRepository.save(course);
    }

    private Map<String, Object> lessonToMap(Lesson lesson, boolean includeAnswers) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", lesson.getId());
        m.put("title", lesson.getTitle());
        m.put("orderIndex", lesson.getOrderIndex());
        m.put("type", lesson.getType().name());
        if (lesson.getType() == LessonType.VIDEO) {
            m.put("videoUrl", lesson.getVideoUrl());
        } else if (lesson.getType() == LessonType.READING) {
            m.put("content", lesson.getContent());
        } else if (lesson.getType() == LessonType.QUIZ) {
            List<QuizQuestion> questions = quizQuestionRepository.findByLesson(lesson);
            List<Map<String, Object>> qDtos = questions.stream().map(q -> {
                Map<String, Object> qm = new LinkedHashMap<>();
                qm.put("id", q.getId());
                qm.put("questionText", q.getQuestionText());
                qm.put("optionA", q.getOptionA());
                qm.put("optionB", q.getOptionB());
                qm.put("optionC", q.getOptionC());
                qm.put("optionD", q.getOptionD());
                if (includeAnswers) qm.put("correctOption", q.getCorrectOption());
                return qm;
            }).collect(Collectors.toList());
            m.put("questions", qDtos);
        }
        return m;
    }

    // GET /api/instructor/courses/{courseId}/lessons
    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable Long courseId, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = requireOwnedCourse(courseId, instructor);
        if (course == null) return ResponseEntity.status(404).body(Map.of("error", "Course not found"));

        List<Map<String, Object>> lessons = lessonRepository.findByCourseOrderByOrderIndexAsc(course).stream()
                .map(l -> lessonToMap(l, true))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lessons);
    }

    // POST /api/instructor/courses/{courseId}/lessons
    // body: { "title": "...", "type": "VIDEO"|"READING"|"QUIZ", "videoUrl": "...", "content": "..." }
    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<?> createLesson(@PathVariable Long courseId, @RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = requireOwnedCourse(courseId, instructor);
        if (course == null) return ResponseEntity.status(404).body(Map.of("error", "Course not found"));

        String title = body.get("title") == null ? null : String.valueOf(body.get("title"));
        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        LessonType type;
        try {
            type = LessonType.valueOf(String.valueOf(body.get("type")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "type must be VIDEO, READING, or QUIZ"));
        }

        int nextOrder = lessonRepository.findByCourseOrderByOrderIndexAsc(course).size() + 1;

        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(title);
        lesson.setType(type);
        lesson.setOrderIndex(nextOrder);
        if (type == LessonType.VIDEO) {
            lesson.setVideoUrl(body.get("videoUrl") == null ? "" : String.valueOf(body.get("videoUrl")));
        } else if (type == LessonType.READING) {
            lesson.setContent(body.get("content") == null ? "" : String.valueOf(body.get("content")));
        }
        lessonRepository.save(lesson);
        syncTotalUnits(course);

        return ResponseEntity.ok(lessonToMap(lesson, true));
    }

    // PUT /api/instructor/lessons/{lessonId}
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<?> updateLesson(@PathVariable Long lessonId, @RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null || requireOwnedCourse(lesson.getCourse().getId(), instructor) == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Lesson not found"));
        }

        if (body.get("title") != null) lesson.setTitle(String.valueOf(body.get("title")));
        if (body.get("videoUrl") != null) lesson.setVideoUrl(String.valueOf(body.get("videoUrl")));
        if (body.get("content") != null) lesson.setContent(String.valueOf(body.get("content")));
        lessonRepository.save(lesson);

        return ResponseEntity.ok(lessonToMap(lesson, true));
    }

    // DELETE /api/instructor/lessons/{lessonId}
    // Cleans up dependent quiz questions and student progress rows first —
    // neither relationship cascades at the entity level.
    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null || requireOwnedCourse(lesson.getCourse().getId(), instructor) == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Lesson not found"));
        }

        Course course = lesson.getCourse();
        quizQuestionRepository.deleteAll(quizQuestionRepository.findByLesson(lesson));
        lessonProgressRepository.deleteAll(lessonProgressRepository.findByLesson(lesson));
        lessonRepository.delete(lesson);
        syncTotalUnits(course);

        return ResponseEntity.ok(Map.of("message", "Lesson deleted"));
    }

    // POST /api/instructor/lessons/{lessonId}/questions
    // body: { "questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctOption": 0 }
    @PostMapping("/lessons/{lessonId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long lessonId, @RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null || requireOwnedCourse(lesson.getCourse().getId(), instructor) == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Lesson not found"));
        }
        if (lesson.getType() != LessonType.QUIZ) {
            return ResponseEntity.badRequest().body(Map.of("error", "This lesson is not a quiz"));
        }

        int correctOption;
        try {
            correctOption = Integer.parseInt(String.valueOf(body.get("correctOption")));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "correctOption must be 0-3"));
        }
        if (correctOption < 0 || correctOption > 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "correctOption must be 0-3"));
        }

        QuizQuestion q = new QuizQuestion();
        q.setLesson(lesson);
        q.setQuestionText(String.valueOf(body.get("questionText")));
        q.setOptionA(String.valueOf(body.get("optionA")));
        q.setOptionB(String.valueOf(body.get("optionB")));
        q.setOptionC(String.valueOf(body.get("optionC")));
        q.setOptionD(String.valueOf(body.get("optionD")));
        q.setCorrectOption(correctOption);
        quizQuestionRepository.save(q);

        Map<String, Object> qm = new LinkedHashMap<>();
        qm.put("id", q.getId());
        qm.put("questionText", q.getQuestionText());
        qm.put("optionA", q.getOptionA());
        qm.put("optionB", q.getOptionB());
        qm.put("optionC", q.getOptionC());
        qm.put("optionD", q.getOptionD());
        qm.put("correctOption", q.getCorrectOption());
        return ResponseEntity.ok(qm);
    }

    // DELETE /api/instructor/questions/{questionId}
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        QuizQuestion q = quizQuestionRepository.findById(questionId).orElse(null);
        if (q == null || requireOwnedCourse(q.getLesson().getCourse().getId(), instructor) == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Question not found"));
        }
        quizQuestionRepository.delete(q);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }

    // -----------------------------------------------------------------
    // Announcements — instructor posts to their own course; students see
    // these via GET /api/announcements (StudentAnnouncementController).
    // -----------------------------------------------------------------

    // GET /api/instructor/courses/{courseId}/announcements
    @GetMapping("/courses/{courseId}/announcements")
    public ResponseEntity<?> getAnnouncements(@PathVariable Long courseId, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = requireOwnedCourse(courseId, instructor);
        if (course == null) return ResponseEntity.status(404).body(Map.of("error", "Course not found"));

        List<Map<String, Object>> result = announcementRepository.findByCourseOrderByCreatedAtDesc(course).stream()
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("message", a.getMessage());
                    m.put("createdAt", a.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // POST /api/instructor/courses/{courseId}/announcements  { "message": "..." }
    @PostMapping("/courses/{courseId}/announcements")
    public ResponseEntity<?> postAnnouncement(@PathVariable Long courseId, @RequestBody Map<String, Object> body, Authentication authentication) {
        User instructor = requireInstructor(authentication);
        Course course = requireOwnedCourse(courseId, instructor);
        if (course == null) return ResponseEntity.status(404).body(Map.of("error", "Course not found"));

        String message = body.get("message") == null ? null : String.valueOf(body.get("message"));
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message can't be empty"));
        }

        Announcement a = new Announcement();
        a.setCourse(course);
        a.setMessage(message);
        a.setCreatedAt(java.time.LocalDateTime.now());
        announcementRepository.save(a);

        return ResponseEntity.ok(Map.of("message", "Announcement posted"));
    }
}
