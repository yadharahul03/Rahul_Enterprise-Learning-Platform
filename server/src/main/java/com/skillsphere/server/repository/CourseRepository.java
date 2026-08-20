package com.skillsphere.server.repository;

import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByTitle(String title);
    List<Course> findByInstructor(User instructor);
    List<Course> findByPublishedTrue();

    @Query("SELECT c FROM Course c WHERE " +
           "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
           "(:difficulty IS NULL OR LOWER(c.difficulty) = LOWER(:difficulty)) AND " +
           "(c.published IS NULL OR c.published = true)")
    Page<Course> searchCourses(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("difficulty") String difficulty,
            Pageable pageable
    );
}