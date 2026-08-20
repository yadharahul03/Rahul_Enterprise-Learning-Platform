package com.skillsphere.server.controller;

import com.skillsphere.server.dto.QuizSubmissionRequest;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private UserRepository userRepository;

    // GET /api/courses/{courseId}/lessons
    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable Long courseId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.getLessonsForCourse(user, courseId));
    }

    // POST /api/lessons/{lessonId}/complete
    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(@PathVariable Long lessonId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.completeLesson(user, lessonId));
    }

    // POST /api/lessons/{lessonId}/submit-quiz
    @PostMapping("/lessons/{lessonId}/submit-quiz")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long lessonId,
            @RequestBody QuizSubmissionRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(lessonService.submitQuiz(user, lessonId, request.getAnswers()));
    }
}