package com.skillsphere.server.controller;

import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.dto.AuthRequest;
import com.skillsphere.server.dto.AuthResponse;
import com.skillsphere.server.dto.UserRegistrationRequest;
import com.skillsphere.server.dto.UserResponseDTO;
import com.skillsphere.server.exception.BadRequestException;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.security.JwtUtil;
import com.skillsphere.server.service.EmailService;
import com.skillsphere.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody UserRegistrationRequest request) {
        UserResponseDTO userDTO = userService.registerUser(request);

        // If instructor account is registered but pending Admin approval (active == false)
        if (Boolean.FALSE.equals(userDTO.getActive())) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Instructor registration request submitted successfully! Your account is pending Admin approval.",
                    new AuthResponse(null, userDTO)
            ));
        }

        String token = jwtUtil.generateToken(userDTO.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Registration successful", new AuthResponse(token, userDTO)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userOpt.get();
        if (user.getPassword() == null) {
            throw new BadRequestException("This account uses Google sign-in. Please use 'Continue with Google'.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            if ("INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
                throw new BadRequestException("Your Instructor account is pending Admin verification and approval. Please contact platform administration.");
            }
            throw new BadRequestException("Your account is currently disabled. Please contact platform administration.");
        }

        UserResponseDTO userDTO = userService.updateLastLogin(user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Login successful", new AuthResponse(token, userDTO)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("If an account with that email exists, a reset link has been sent.", null));
        }

        User user = userOpt.get();
        if (user.getPassword() == null) {
            return ResponseEntity.ok(ApiResponse.success("This account uses Google sign-in. Please use 'Continue with Google'.", null));
        }

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
        return ResponseEntity.ok(ApiResponse.success("If an account with that email exists, a reset link has been sent.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Valid token and new password (min 6 characters) are required");
        }

        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            throw new BadRequestException("Invalid or expired reset link");
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now log in.", null));
    }
}