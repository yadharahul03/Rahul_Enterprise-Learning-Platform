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
public class CertificateDTO {
    private Long id;
    private String certificateNumber;
    private String userName;
    private String userEmail;
    private Long courseId;
    private String courseTitle;
    private Integer totalUnits;
    private LocalDateTime issueDate;
    private String formattedIssueDate;
    private Integer completionPercentage;
    private String verifyUrl;
}
