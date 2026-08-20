package com.skillsphere.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String title;
    private String category;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer durationHours;
    private String thumbnailUrl;
    private Integer totalUnits;
    private String description;
    private Boolean published;
    private String instructorName;
    private Boolean enrolled;
    private Double rating;
    private Integer studentCount;
    private Integer priceINR;
}
