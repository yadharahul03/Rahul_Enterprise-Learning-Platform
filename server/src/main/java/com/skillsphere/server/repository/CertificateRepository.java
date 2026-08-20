package com.skillsphere.server.repository;

import com.skillsphere.server.model.Certificate;
import com.skillsphere.server.model.Course;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    Optional<Certificate> findByUserAndCourse(User user, Course course);
    List<Certificate> findByUser(User user);
}
