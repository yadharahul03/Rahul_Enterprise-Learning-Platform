package com.skillsphere.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {
    private boolean success = false;
    private String error;
    private List<String> details;
    private LocalDateTime timestamp;

    public ApiErrorResponse(String error, List<String> details) {
        this.error = error;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public ApiErrorResponse(String error) {
        this.error = error;
        this.details = List.of(error);
        this.timestamp = LocalDateTime.now();
    }
}
