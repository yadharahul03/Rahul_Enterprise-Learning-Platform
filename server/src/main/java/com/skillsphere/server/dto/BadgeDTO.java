package com.skillsphere.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private Boolean earned;
    private LocalDateTime earnedAt;
}
