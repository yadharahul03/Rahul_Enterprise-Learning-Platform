package com.skillsphere.server.service;

import com.skillsphere.server.dto.QuizResultDTO;
import com.skillsphere.server.model.*;
import com.skillsphere.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LessonService {

    @Autowired private LessonRepository lessonRepository;
    @Autowired private QuizQuestionRepository quizQuestionRepository;
    @Autowired private LessonProgressRepository lessonProgressRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private DailyActivityRepository dailyActivityRepository;
    @Autowired private EmailService emailService;
    @Autowired private BadgeService badgeService;

    public List<Map<String, Object>> getLessonsForCourse(User user, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderIndexAsc(course);

        return lessons.stream().map(lesson -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", lesson.getId());
            m.put("title", lesson.getTitle());
            m.put("orderIndex", lesson.getOrderIndex());
            m.put("type", lesson.getType().name());

            boolean completed = lessonProgressRepository.findByUserAndLesson(user, lesson)
                    .map(LessonProgress::getCompleted)
                    .orElse(false);
            m.put("completed", completed);

            if (lesson.getType() == LessonType.VIDEO) {
                m.put("videoUrl", lesson.getVideoUrl());
            } else if (lesson.getType() == LessonType.READING) {
                m.put("content", lesson.getContent());
            } else if (lesson.getType() == LessonType.QUIZ) {
                List<QuizQuestion> questions = quizQuestionRepository.findByLesson(lesson);
                List<Map<String, Object>> questionDtos = questions.stream().map(q -> {
                    Map<String, Object> qm = new LinkedHashMap<>();
                    qm.put("id", q.getId());
                    qm.put("questionText", q.getQuestionText());
                    qm.put("options", List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()));
                    return qm;
                }).collect(Collectors.toList());
                m.put("questions", questionDtos);
            }

            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> completeLesson(User user, Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (lesson.getType() == LessonType.QUIZ) {
            throw new RuntimeException("Quiz lessons must be completed via submit-quiz");
        }

        markLessonComplete(user, lesson);
        syncEnrollmentProgress(user, lesson.getCourse());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("lessonId", lesson.getId());
        result.put("completed", true);
        return result;
    }

    public QuizResultDTO submitQuiz(User user, Long lessonId, List<Integer> answers) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (lesson.getType() != LessonType.QUIZ) {
            throw new RuntimeException("This lesson is not a quiz");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByLesson(lesson);
        if (answers == null || answers.size() != questions.size()) {
            throw new RuntimeException("Expected " + questions.size() + " answers");
        }

        int correctCount = 0;
        for (int i = 0; i < questions.size(); i++) {
            if (questions.get(i).getCorrectOption().equals(answers.get(i))) {
                correctCount++;
            }
        }

        int scorePercent = (int) Math.round((correctCount * 100.0) / questions.size());
        boolean passed = scorePercent >= 70;
        String earnedBadgeName = null;

        if (passed) {
            markLessonComplete(user, lesson);
            syncEnrollmentProgress(user, lesson.getCourse());

            if (scorePercent == 100) {
                badgeService.awardBadge(user, "QUIZ_MASTER");
                earnedBadgeName = "Quiz Master 🏆";
            }
        }

        return QuizResultDTO.builder()
                .correctCount(correctCount)
                .totalQuestions(questions.size())
                .scorePercent(scorePercent)
                .passed(passed)
                .lessonId(lessonId)
                .newBadgeEarned(earnedBadgeName)
                .build();
    }

    private void markLessonComplete(User user, Lesson lesson) {
        LessonProgress progress = lessonProgressRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    LessonProgress p = new LessonProgress();
                    p.setUser(user);
                    p.setLesson(lesson);
                    return p;
                });
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);
    }

    private void syncEnrollmentProgress(User user, Course course) {
        int completedLessons = lessonProgressRepository.countByUserAndLesson_CourseAndCompletedTrue(user, course);

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));

        enrollment.setUnitsCompleted(Math.min(completedLessons, course.getTotalUnits()));
        enrollment.setLastAccessed(LocalDateTime.now());

        boolean justCompleted = enrollment.getUnitsCompleted() >= course.getTotalUnits()
                && !Boolean.TRUE.equals(enrollment.getCertificateEmailed());
        if (justCompleted) {
            enrollment.setCertificateEmailed(true);
        }
        enrollmentRepository.save(enrollment);

        // Auto-check and award gamified badges
        badgeService.checkAndAwardBadges(user);

        if (justCompleted) {
            try {
                emailService.sendCourseCompletionEmail(user.getEmail(), user.getName(), course.getTitle());
            } catch (Exception e) {
                // Ignore email service exceptions
            }
        }

        LocalDate today = LocalDate.now();
        DailyActivity activity = dailyActivityRepository.findByUserAndActivityDate(user, today)
                .orElseGet(() -> {
                    DailyActivity a = new DailyActivity();
                    a.setUser(user);
                    a.setActivityDate(today);
                    a.setUnitsCompleted(0);
                    a.setHoursSpent(0.0);
                    return a;
                });
        activity.setUnitsCompleted(activity.getUnitsCompleted() + 1);
        activity.setHoursSpent(activity.getHoursSpent() + 0.5);
        dailyActivityRepository.save(activity);
    }
}