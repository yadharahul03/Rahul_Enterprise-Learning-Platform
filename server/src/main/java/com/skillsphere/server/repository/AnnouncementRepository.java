package com.skillsphere.server.repository;

import com.skillsphere.server.model.Announcement;
import com.skillsphere.server.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByCourseOrderByCreatedAtDesc(Course course);
    List<Announcement> findByCourseInOrderByCreatedAtDesc(List<Course> courses);
}
