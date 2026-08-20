package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {
    List<LiveSession> findByCourseOrderByStartTimeAsc(Course course);
    List<LiveSession> findByCourseInOrderByStartTimeAsc(List<Course> courses);
    List<LiveSession> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime time);
    List<LiveSession> findAllByOrderByStartTimeAsc();
}
