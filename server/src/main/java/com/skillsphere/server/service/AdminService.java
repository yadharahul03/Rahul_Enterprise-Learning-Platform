package com.skillsphere.server.service;

import com.skillsphere.server.dto.AdminDashboardDTO;
import com.skillsphere.server.dto.UserResponseDTO;

import java.util.List;

public interface AdminService {
    AdminDashboardDTO getAdminDashboard();
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO toggleUserActiveStatus(Long userId);
}
