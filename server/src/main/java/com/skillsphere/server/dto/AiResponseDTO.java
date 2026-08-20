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
public class AiResponseDTO {
    private String response;
    private String type;
    private List<String> suggestions;
    private List<String> recommendedCourses;
}
