package com.skillsphere.server.controller;

import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.CertificateDTO;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserRepository userRepository;

    // GET /api/certificates/course/{courseId} — Authenticated student certificate fetch/issue
    @GetMapping("/certificates/course/{courseId}")
    public ResponseEntity<ApiResponse<CertificateDTO>> getCertificateForCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CertificateDTO certificate = certificateService.getOrCreateCertificate(user, courseId);
        return ResponseEntity.ok(ApiResponse.success("Certificate issued successfully", certificate));
    }

    // GET /api/certificates/my-certificates — Authenticated student certificates list
    @GetMapping("/certificates/my-certificates")
    public ResponseEntity<ApiResponse<List<CertificateDTO>>> getMyCertificates(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CertificateDTO> certificates = certificateService.getUserCertificates(user);
        return ResponseEntity.ok(ApiResponse.success(certificates));
    }

    // GET /api/public/certificates/verify/{certNumber} — Public certificate verification endpoint (No auth required)
    @GetMapping("/public/certificates/verify/{certNumber}")
    public ResponseEntity<ApiResponse<CertificateDTO>> verifyCertificatePublic(@PathVariable String certNumber) {
        CertificateDTO certificate = certificateService.verifyCertificate(certNumber);
        return ResponseEntity.ok(ApiResponse.success("Certificate verified successfully", certificate));
    }
}
