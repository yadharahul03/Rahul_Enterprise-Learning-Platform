package com.skillsphere.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {
    private int scorePercent;
    private int correctCount;
    private int totalQuestions;
    private boolean passed;
    private Long lessonId;
    private String newBadgeEarned;
}
