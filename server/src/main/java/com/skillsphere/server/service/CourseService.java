package com.skillsphere.server.service;

import com.skillsphere.server.dto.CourseDTO;
import com.skillsphere.server.dto.PageResponse;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;

import java.util.List;

public interface CourseService {
    PageResponse<CourseDTO> searchCourses(String keyword, String category, String difficulty, int page, int size, String sortBy, String sortDir, User user);
    List<CourseDTO> getAllCoursesForUser(User user);
    CourseDTO getCourseById(Long courseId, User user);
    CourseDTO mapToDTO(Course course, User user);
}
