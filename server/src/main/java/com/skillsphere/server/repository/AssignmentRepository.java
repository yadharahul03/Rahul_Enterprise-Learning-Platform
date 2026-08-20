package com.skillsphere.server.repository;

import com.skillsphere.server.model.Assignment;
import com.skillsphere.server.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseOrderByDueDateAsc(Course course);
    List<Assignment> findByCourseInOrderByDueDateAsc(List<Course> courses);
    List<Assignment> findAllByOrderByDueDateAsc();
}
