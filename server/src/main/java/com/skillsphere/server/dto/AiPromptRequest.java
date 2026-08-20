package com.skillsphere.server.dto;

import lombok.Data;

import java.util.List;

@Data
public class AiPromptRequest {
    private String prompt;
    private String type; // EXPLAIN_CONCEPT, SUMMARY, DOUBT, RECOMMENDATION, GENERATE_QUIZ, EXPLAIN_CODE, INTERVIEW_PREP
    private String context;
    private List<String> topics;
}
