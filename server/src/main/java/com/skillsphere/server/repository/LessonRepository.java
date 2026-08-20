package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseOrderByOrderIndexAsc(Course course);
}