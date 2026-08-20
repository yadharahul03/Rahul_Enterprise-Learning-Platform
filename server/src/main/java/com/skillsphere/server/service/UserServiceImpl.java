package com.skillsphere.server.service;

import com.skillsphere.server.dto.UserRegistrationRequest;
import com.skillsphere.server.dto.UserResponseDTO;
import com.skillsphere.server.exception.BadRequestException;
import com.skillsphere.server.exception.ResourceNotFoundException;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Value("${app.admin-secret-key:SkillSphereAdminSecret2026}")
    private String configuredAdminSecretKey;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserResponseDTO registerUser(UserRegistrationRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email address is already registered");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Name is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        String role = "STUDENT";
        boolean isActive = true;

        if (request.getRole() != null) {
            String uRole = request.getRole().toUpperCase();
            if (uRole.equals("ADMIN")) {
                String providedSecret = request.getAdminSecretKey();
                if (providedSecret == null || !configuredAdminSecretKey.equals(providedSecret.trim())) {
                    throw new BadRequestException("Access Denied: Valid Admin Secret Passkey is required to register an Admin account.");
                }
                role = "ADMIN";
                isActive = true;
            } else if (uRole.equals("INSTRUCTOR")) {
                role = "INSTRUCTOR";
                // Professional Platform Policy: Instructor accounts require Admin approval before activation
                isActive = false;
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .provider("LOCAL")
                .active(isActive)
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .location(request.getLocation())
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    @Override
    public UserResponseDTO getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDTO(user);
    }

    @Override
    public UserResponseDTO updateLastLogin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setLastLoginAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO mapToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .providerId(user.getProviderId())
                .active(user.getActive())
                .profilePicture(user.getProfilePicture())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .isGoogleAccount(user.getPassword() == null)
                .themePreference(user.getThemePreference() != null ? user.getThemePreference() : "dark")
                .emailNotifications(user.getEmailNotifications() != null ? user.getEmailNotifications() : true)
                .build();
    }
}
