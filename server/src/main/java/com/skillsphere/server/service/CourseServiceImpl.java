package com.skillsphere.server.service;

import com.skillsphere.server.dto.CourseDTO;
import com.skillsphere.server.dto.PageResponse;
import com.skillsphere.server.exception.ResourceNotFoundException;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public PageResponse<CourseDTO> searchCourses(String keyword, String category, String difficulty, int page, int size, String sortBy, String sortDir, User user) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String kw = (keyword == null || keyword.isBlank() || "null".equalsIgnoreCase(keyword)) ? null : keyword.trim();
        String cat = (category == null || category.isBlank() || "All".equalsIgnoreCase(category) || "null".equalsIgnoreCase(category)) ? null : category.trim();
        String diff = (difficulty == null || difficulty.isBlank() || "All".equalsIgnoreCase(difficulty) || "null".equalsIgnoreCase(difficulty)) ? null : difficulty.trim();

        Page<Course> coursePage = courseRepository.searchCourses(kw, cat, diff, pageable);

        Set<Long> enrolledIds = user != null
                ? enrollmentRepository.findByUser(user).stream().map(e -> e.getCourse().getId()).collect(Collectors.toSet())
                : Set.of();

        List<CourseDTO> content = coursePage.getContent().stream()
                .map(c -> buildCourseDTO(c, enrolledIds.contains(c.getId())))
                .collect(Collectors.toList());

        return PageResponse.<CourseDTO>builder()
                .content(content)
                .pageNo(coursePage.getNumber())
                .pageSize(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .build();
    }

    @Override
    public List<CourseDTO> getAllCoursesForUser(User user) {
        Set<Long> enrolledIds = user != null
                ? enrollmentRepository.findByUser(user).stream().map(e -> e.getCourse().getId()).collect(Collectors.toSet())
                : Set.of();

        return courseRepository.findAll().stream()
                .filter(c -> c.getPublished() == null || c.getPublished())
                .map(c -> buildCourseDTO(c, enrolledIds.contains(c.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public CourseDTO getCourseById(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        boolean enrolled = user != null && enrollmentRepository.findByUser(user).stream()
                .anyMatch(e -> e.getCourse().getId().equals(courseId));

        return buildCourseDTO(course, enrolled);
    }

    @Override
    public CourseDTO mapToDTO(Course course, User user) {
        boolean enrolled = user != null && enrollmentRepository.findByUser(user).stream()
                .anyMatch(e -> e.getCourse().getId().equals(course.getId()));
        return buildCourseDTO(course, enrolled);
    }

    private CourseDTO buildCourseDTO(Course c, boolean enrolled) {
        int studentCount = enrollmentRepository.findByCourse(c).size();
        return CourseDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .category(c.getCategory())
                .difficulty(c.getDifficulty() != null ? c.getDifficulty() : "BEGINNER")
                .durationHours(c.getDurationHours() != null ? c.getDurationHours() : 20)
                .thumbnailUrl(c.getThumbnailUrl())
                .totalUnits(c.getTotalUnits())
                .description(c.getDescription())
                .published(c.getPublished() == null || c.getPublished())
                .instructorName(c.getInstructor() != null ? c.getInstructor().getName() : "Enterprise Learning Editorial Team")
                .enrolled(enrolled)
                .rating(4.8)
                .studentCount(studentCount)
                .priceINR(0) // Free open enrollment
                .build();
    }
}
