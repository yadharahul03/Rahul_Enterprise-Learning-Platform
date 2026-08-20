package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUser(User user);
    List<Enrollment> findByUserOrderByLastAccessedDesc(User user);
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    List<Enrollment> findByCourse(Course course);
}