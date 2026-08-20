package com.skillsphere.server.service;

import com.skillsphere.server.dto.CertificateDTO;
import com.skillsphere.server.exception.BadRequestException;
import com.skillsphere.server.exception.ResourceNotFoundException;
import com.skillsphere.server.model.Certificate;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CertificateRepository;
import com.skillsphere.server.repository.CourseRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CertificateServiceImpl implements CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public CertificateDTO getOrCreateCertificate(User user, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new BadRequestException("You are not enrolled in this course"));

        boolean isCompleted = enrollment.getUnitsCompleted() >= course.getTotalUnits();
        if (!isCompleted) {
            throw new BadRequestException("Course completion required (100% units completed) to issue certificate. Current progress: "
                    + enrollment.getUnitsCompleted() + "/" + course.getTotalUnits() + " units.");
        }

        Optional<Certificate> existing = certificateRepository.findByUserAndCourse(user, course);
        Certificate cert;
        if (existing.isPresent()) {
            cert = existing.get();
        } else {
            String certNum = "SS-CERT-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            cert = Certificate.builder()
                    .certificateNumber(certNum)
                    .user(user)
                    .course(course)
                    .issueDate(LocalDateTime.now())
                    .completionPercentage(100)
                    .build();
            cert = certificateRepository.save(cert);
        }

        return mapToDTO(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateDTO verifyCertificate(String certificateNumber) {
        Certificate cert = certificateRepository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with verification ID: " + certificateNumber));
        return mapToDTO(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateDTO> getUserCertificates(User user) {
        return certificateRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CertificateDTO mapToDTO(Certificate cert) {
        String dateStr = cert.getIssueDate() != null
                ? cert.getIssueDate().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"))
                : "";

        return CertificateDTO.builder()
                .id(cert.getId())
                .certificateNumber(cert.getCertificateNumber())
                .userName(cert.getUser().getName())
                .userEmail(cert.getUser().getEmail())
                .courseId(cert.getCourse().getId())
                .courseTitle(cert.getCourse().getTitle())
                .totalUnits(cert.getCourse().getTotalUnits())
                .issueDate(cert.getIssueDate())
                .formattedIssueDate(dateStr)
                .completionPercentage(cert.getCompletionPercentage())
                .verifyUrl("http://localhost:5173/verify-certificate/" + cert.getCertificateNumber())
                .build();
    }
}
