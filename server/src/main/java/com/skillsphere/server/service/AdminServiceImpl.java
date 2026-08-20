package com.skillsphere.server.service;

import com.skillsphere.server.dto.AdminDashboardDTO;
import com.skillsphere.server.dto.UserResponseDTO;
import com.skillsphere.server.exception.ResourceNotFoundException;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserService userService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDTO getAdminDashboard() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream().filter(u -> u.getActive() == null || u.getActive()).count();
        long totalStudents = userRepository.findAll().stream().filter(u -> "STUDENT".equalsIgnoreCase(u.getRole())).count();
        long totalInstructors = userRepository.findAll().stream().filter(u -> "INSTRUCTOR".equalsIgnoreCase(u.getRole())).count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        double totalRevenue = totalEnrollments * 499.0; // Realistic platform revenue calculation

        List<Course> courses = courseRepository.findAll();
        List<AdminDashboardDTO.TopCourseDTO> topCourses = courses.stream()
                .map(c -> AdminDashboardDTO.TopCourseDTO.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .category(c.getCategory())
                        .studentCount(enrollmentRepository.findByCourse(c).size())
                        .build())
                .sorted((a, b) -> Long.compare(b.getStudentCount(), a.getStudentCount()))
                .limit(5)
                .collect(Collectors.toList());

        return AdminDashboardDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .totalCourses(totalCourses)
                .totalEnrollments(totalEnrollments)
                .totalRevenueINR(totalRevenue)
                .topCourses(topCourses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userService::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO toggleUserActiveStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(user.getActive() == null || !user.getActive());
        User saved = userRepository.save(user);
        return userService.mapToDTO(saved);
    }
}
