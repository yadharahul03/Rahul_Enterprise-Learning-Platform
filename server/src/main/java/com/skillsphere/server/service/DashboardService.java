package com.skillsphere.server.service;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.DailyActivity;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.Lesson;
import com.skillsphere.server.model.LessonType;
import com.skillsphere.server.model.QuizQuestion;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.DailyActivityRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.LessonRepository;
import com.skillsphere.server.repository.QuizQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DailyActivityRepository dailyActivityRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    // ---------------------------------------------------------------------
    // GET /api/dashboard/summary
    // ---------------------------------------------------------------------
    public Map<String, Object> getSummary(User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);

        int coursesEnrolled = enrollments.size();
        int coursesCompleted = (int) enrollments.stream()
                .filter(e -> e.getUnitsCompleted() >= e.getCourse().getTotalUnits())
                .count();
        int unitsCompleted = enrollments.stream().mapToInt(Enrollment::getUnitsCompleted).sum();
        int unitsTotal = enrollments.stream().mapToInt(e -> e.getCourse().getTotalUnits()).sum();

        List<Map<String, Object>> weeklyActivity = buildWeeklyActivity(user);
        double hoursThisWeek = weeklyActivity.stream()
                .mapToDouble(day -> (double) day.get("hours"))
                .sum();

        int streakDays = computeStreak(user);
        List<Map<String, Object>> skillProgress = buildSkillProgress(enrollments);
        List<Map<String, Object>> achievements = buildAchievements(
                coursesEnrolled, coursesCompleted, streakDays);

        Map<String, Object> userMap = Map.of(
                "name", user.getName(),
                "streakDays", streakDays
        );

        Map<String, Object> stats = Map.of(
                "coursesEnrolled", coursesEnrolled,
                "coursesCompleted", coursesCompleted,
                "unitsCompleted", unitsCompleted,
                "unitsTotal", unitsTotal,
                "hoursThisWeek", Math.round(hoursThisWeek * 10.0) / 10.0
        );

        // Strip "hours" helper field before returning weeklyActivity to the frontend
        List<Map<String, Object>> weeklyActivityForResponse = weeklyActivity.stream()
                .map(d -> Map.<String, Object>of("day", d.get("day"), "units", d.get("units")))
                .collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("user", userMap);
        summary.put("stats", stats);
        summary.put("weeklyActivity", weeklyActivityForResponse);
        summary.put("skillProgress", skillProgress);
        summary.put("achievements", achievements);
        return summary;
    }

    // ---------------------------------------------------------------------
    // GET /api/dashboard/enrollments
    // ---------------------------------------------------------------------
    public Map<String, Object> getEnrollments(User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserOrderByLastAccessedDesc(user);

        List<Map<String, Object>> continueLearning = enrollments.stream()
                .filter(e -> e.getUnitsCompleted() > 0 && e.getUnitsCompleted() < e.getCourse().getTotalUnits())
                .limit(3)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", e.getId());
                    m.put("courseId", e.getCourse().getId());
                    m.put("title", e.getCourse().getTitle());
                    m.put("lastAccessed", formatRelativeTime(e.getLastAccessed()));
                    m.put("percentComplete", percent(e.getUnitsCompleted(), e.getCourse().getTotalUnits()));
                    m.put("unitsCompleted", e.getUnitsCompleted());
                    m.put("unitsTotal", e.getCourse().getTotalUnits());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> enrolledCourses = enrollments.stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", e.getId());
                    m.put("courseId", e.getCourse().getId());
                    m.put("title", e.getCourse().getTitle());
                    m.put("category", e.getCourse().getCategory());
                    m.put("percentComplete", percent(e.getUnitsCompleted(), e.getCourse().getTotalUnits()));
                    return m;
                })
                .collect(Collectors.toList());

        Set<Long> enrolledCourseIds = enrollments.stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toSet());

        List<Map<String, Object>> recommended = courseRepository.findAll().stream()
                .filter(c -> !enrolledCourseIds.contains(c.getId()))
                .limit(3)
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("title", c.getTitle());
                    m.put("category", c.getCategory());
                    m.put("reason", "Explore this to grow your " + c.getCategory() + " skills");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("continueLearning", continueLearning);
        result.put("enrolledCourses", enrolledCourses);
        result.put("recommended", recommended);
        return result;
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private int percent(int completed, int total) {
        if (total <= 0) return 0;
        return (int) Math.round((completed * 100.0) / total);
    }

    private List<Map<String, Object>> buildWeeklyActivity(User user) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(6);
        List<DailyActivity> records = dailyActivityRepository
                .findByUserAndActivityDateBetweenOrderByActivityDateAsc(user, start, today);

        Map<LocalDate, DailyActivity> byDate = records.stream()
                .collect(Collectors.toMap(DailyActivity::getActivityDate, r -> r));

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            DailyActivity activity = byDate.get(date);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("day", date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("units", activity != null ? activity.getUnitsCompleted() : 0);
            entry.put("hours", activity != null ? activity.getHoursSpent() : 0.0);
            result.add(entry);
        }
        return result;
    }

    private int computeStreak(User user) {
        LocalDate day = LocalDate.now();

        // A streak isn't broken until a full day passes with no activity,
        // so if today has nothing logged yet, start counting from yesterday.
        Optional<DailyActivity> todayActivity = dailyActivityRepository.findByUserAndActivityDate(user, day);
        if (todayActivity.isEmpty() || todayActivity.get().getUnitsCompleted() == 0) {
            day = day.minusDays(1);
        }

        int streak = 0;
        while (true) {
            Optional<DailyActivity> activity = dailyActivityRepository.findByUserAndActivityDate(user, day);
            if (activity.isPresent() && activity.get().getUnitsCompleted() > 0) {
                streak++;
                day = day.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private List<Map<String, Object>> buildSkillProgress(List<Enrollment> enrollments) {
        Map<String, List<Enrollment>> byCategory = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse().getCategory()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Enrollment>> entry : byCategory.entrySet()) {
            double avgPercent = entry.getValue().stream()
                    .mapToInt(e -> percent(e.getUnitsCompleted(), e.getCourse().getTotalUnits()))
                    .average()
                    .orElse(0);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("skill", entry.getKey());
            m.put("percent", (int) Math.round(avgPercent));
            result.add(m);
        }
        return result;
    }

    private List<Map<String, Object>> buildAchievements(int coursesEnrolled, int coursesCompleted, int streakDays) {
        List<Map<String, Object>> achievements = new ArrayList<>();

        achievements.add(Map.of(
                "id", 1, "title", "First Summit",
                "description", "Complete your first course",
                "earned", coursesCompleted >= 1
        ));
        achievements.add(Map.of(
                "id", 2, "title", "7-Day Streak",
                "description", "Learn 7 days in a row",
                "earned", streakDays >= 7
        ));
        achievements.add(Map.of(
                "id", 3, "title", "Basecamp Reached",
                "description", "Enroll in 5 courses",
                "earned", coursesEnrolled >= 5
        ));
        achievements.add(Map.of(
                "id", 4, "title", "Full Ascent",
                "description", "Complete all enrolled courses",
                "earned", coursesEnrolled > 0 && coursesCompleted == coursesEnrolled
        ));

        return achievements;
    }

    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Never";
        long daysAgo = ChronoUnit.DAYS.between(dateTime.toLocalDate(), LocalDate.now());
        if (daysAgo == 0) return "Today";
        if (daysAgo == 1) return "Yesterday";
        return daysAgo + " days ago";
    }

    // ---------------------------------------------------------------------
    // Dev-only helper: ensures all 8 sample courses (and their lessons) exist,
    // and enrolls the user in up to 3 courses they aren't already in. Safe to
    // call repeatedly — never duplicates courses, lessons, or enrollments.
    // ---------------------------------------------------------------------
    public void seedDemoData(User user) {
        ensureCourseWithLessons("React Fundamentals", "Frontend", 20);
        ensureCourseWithLessons("Spring Boot Essentials", "Backend", 20);
        ensureCourseWithLessons("MySQL for Developers", "Databases", 15);
        ensureCourseWithLessons("Data Structures Basics", "DSA", 25);
        ensureCourseWithLessons("REST API Design", "Backend", 12);
        ensureCourseWithLessons("Advanced React Patterns", "Frontend", 18);
        ensureCourseWithLessons("SQL Query Optimization", "Databases", 10);
        ensureCourseWithLessons("Algorithms in Practice", "DSA", 22);

        List<Course> courses = courseRepository.findAll();
        Random rand = new Random();

        // Only enroll the user in courses they aren't already enrolled in,
        // so re-running this doesn't create duplicate enrollments.
        List<Course> notYetEnrolled = courses.stream()
                .filter(c -> enrollmentRepository.findByUserAndCourse(user, c).isEmpty())
                .collect(Collectors.toList());

        for (int i = 0; i < Math.min(3, notYetEnrolled.size()); i++) {
            Course course = notYetEnrolled.get(i);
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setUnitsCompleted(0);
            enrollment.setEnrolledAt(LocalDateTime.now());
            enrollment.setLastAccessed(LocalDateTime.now());
            enrollmentRepository.save(enrollment);
        }

        // Log activity for the last 7 days
        for (int i = 0; i < 7; i++) {
            LocalDate date = LocalDate.now().minusDays(i);
            if (dailyActivityRepository.findByUserAndActivityDate(user, date).isPresent()) continue;
            DailyActivity activity = new DailyActivity();
            activity.setUser(user);
            activity.setActivityDate(date);
            activity.setUnitsCompleted(rand.nextInt(6));
            activity.setHoursSpent(Math.round(rand.nextDouble() * 20) / 10.0);
            dailyActivityRepository.save(activity);
        }
    }

    // ---------------------------------------------------------------------
    // POST /api/dashboard/enrollments/{id}/progress
    // Logs progress on a single enrollment and today's activity log.
    // ---------------------------------------------------------------------
    public Map<String, Object> addProgress(User user, Long enrollmentId, int unitsToAdd) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        int totalUnits = enrollment.getCourse().getTotalUnits();
        int newUnits = Math.min(enrollment.getUnitsCompleted() + unitsToAdd, totalUnits);
        enrollment.setUnitsCompleted(newUnits);
        enrollment.setLastAccessed(LocalDateTime.now());
        enrollmentRepository.save(enrollment);

        // Also credit today's activity log, so the weekly chart and streak reflect this
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
        activity.setUnitsCompleted(activity.getUnitsCompleted() + unitsToAdd);
        activity.setHoursSpent(activity.getHoursSpent() + (unitsToAdd * 0.5));
        dailyActivityRepository.save(activity);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", enrollment.getId());
        result.put("title", enrollment.getCourse().getTitle());
        result.put("unitsCompleted", enrollment.getUnitsCompleted());
        result.put("unitsTotal", totalUnits);
        result.put("percentComplete", percent(enrollment.getUnitsCompleted(), totalUnits));
        return result;
    }

    private Course newCourse(String title, String category, int totalUnits) {
        Course c = new Course();
        c.setTitle(title);
        c.setCategory(category);
        c.setTotalUnits(totalUnits);
        return c;
    }

    // Finds the course by title if it already exists (preserving its id and
    // any existing enrollments), or creates it if not. Either way, backfills
    // lessons only if this course doesn't have any yet — safe to call
    // repeatedly without duplicating courses, lessons, or enrollments.
    private void ensureCourseWithLessons(String title, String category, int totalUnits) {
        Course course = courseRepository.findByTitle(title)
                .orElseGet(() -> courseRepository.save(newCourse(title, category, totalUnits)));

        boolean alreadyHasLessons = !lessonRepository.findByCourseOrderByOrderIndexAsc(course).isEmpty();
        if (alreadyHasLessons) {
            return;
        }

        for (int i = 0; i < totalUnits; i++) {
            Lesson lesson = new Lesson();
            lesson.setCourse(course);
            lesson.setOrderIndex(i);

            boolean isQuiz = (i + 1) % 5 == 0;
            boolean isReading = !isQuiz && (i % 3 == 2);

            if (isQuiz) {
                lesson.setType(LessonType.QUIZ);
                lesson.setTitle("Quiz: " + category + " Checkpoint " + ((i + 1) / 5));
                Lesson savedLesson = lessonRepository.save(lesson);
                seedQuizQuestions(savedLesson, category);
            } else if (isReading) {
                lesson.setType(LessonType.READING);
                lesson.setTitle("Reading: " + title + " - Part " + (i + 1));
                lesson.setContent(
                        "This reading covers key concepts in " + title +
                                ". Take your time to review the material before moving to the next lesson."
                );
                lessonRepository.save(lesson);
            } else {
                lesson.setType(LessonType.VIDEO);
                lesson.setTitle("Video: " + title + " - Lesson " + (i + 1));
                lesson.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
                lessonRepository.save(lesson);
            }
        }
    }

    private void seedQuizQuestions(Lesson lesson, String category) {
        quizQuestionRepository.save(newQuestion(lesson,
                "Which of these is most closely associated with " + category + "?",
                category, "Unrelated Topic A", "Unrelated Topic B", "Unrelated Topic C", 0));
        quizQuestionRepository.save(newQuestion(lesson,
                "A strong understanding of " + category + " helps you build what kind of skills?",
                "Practical, job-ready skills", "Cooking skills", "Gardening skills", "Painting skills", 0));
        quizQuestionRepository.save(newQuestion(lesson,
                "What is a good habit while learning " + category + "?",
                "Practicing consistently", "Skipping fundamentals", "Avoiding practice", "Never reviewing mistakes", 0));
    }

    private QuizQuestion newQuestion(Lesson lesson, String text, String a, String b, String c, String d, int correct) {
        QuizQuestion q = new QuizQuestion();
        q.setLesson(lesson);
        q.setQuestionText(text);
        q.setOptionA(a);
        q.setOptionB(b);
        q.setOptionC(c);
        q.setOptionD(d);
        q.setCorrectOption(correct);
        return q;
    }
}
