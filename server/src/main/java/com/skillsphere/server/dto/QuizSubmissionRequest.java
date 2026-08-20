package com.skillsphere.server.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuizSubmissionRequest {
    private List<Integer> answers;
}