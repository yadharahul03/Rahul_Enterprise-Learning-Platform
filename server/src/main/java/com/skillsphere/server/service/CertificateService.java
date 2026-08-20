package com.skillsphere.server.service;

import com.skillsphere.server.dto.CertificateDTO;
import com.skillsphere.server.model.User;

import java.util.List;

public interface CertificateService {
    CertificateDTO getOrCreateCertificate(User user, Long courseId);
    CertificateDTO verifyCertificate(String certificateNumber);
    List<CertificateDTO> getUserCertificates(User user);
}
