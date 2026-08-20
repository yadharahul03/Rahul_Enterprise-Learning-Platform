package com.skillsphere.server.service;

import com.skillsphere.server.dto.UserRegistrationRequest;
import com.skillsphere.server.dto.UserResponseDTO;
import com.skillsphere.server.model.User;

import java.util.List;

public interface UserService {
    UserResponseDTO registerUser(UserRegistrationRequest request);
    UserResponseDTO getUserProfileByEmail(String email);
    UserResponseDTO updateLastLogin(String email);
    UserResponseDTO mapToDTO(User user);
    List<UserResponseDTO> getAllUsers();
}
