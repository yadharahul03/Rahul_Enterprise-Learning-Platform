package com.skillsphere.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private long totalUsers;
    private long activeUsers;
    private long totalStudents;
    private long totalInstructors;
    private long totalCourses;
    private long totalEnrollments;
    private double totalRevenueINR;
    private List<TopCourseDTO> topCourses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCourseDTO {
        private Long id;
        private String title;
        private String category;
        private long studentCount;
    }
}
