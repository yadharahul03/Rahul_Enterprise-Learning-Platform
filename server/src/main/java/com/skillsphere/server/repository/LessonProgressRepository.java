package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Lesson;
import com.skillsphere.server.model.LessonProgress;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);

    List<LessonProgress> findByUserAndLesson_Course(User user, Course course);

    List<LessonProgress> findByLesson(Lesson lesson);

    int countByUserAndLesson_CourseAndCompletedTrue(User user, Course course);
}