package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.ForumThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
    List<ForumThread> findByCourseOrderByCreatedAtDesc(Course course);
    List<ForumThread> findByTagOrderByCreatedAtDesc(String tag);
    List<ForumThread> findAllByOrderByCreatedAtDesc();
}
