package com.skillsphere.server.controller;

import com.skillsphere.server.model.Resume;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.ResumeRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/resume
    @GetMapping
    public ResponseEntity<?> getResume(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Resume> resumeOpt = resumeRepository.findByUser(user);
        if (resumeOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("jsonContent", "{}"));
        }

        return ResponseEntity.ok(Map.of(
                "id", resumeOpt.get().getId(),
                "jsonContent", resumeOpt.get().getJsonContent(),
                "updatedAt", resumeOpt.get().getUpdatedAt()
        ));
    }

    // PUT /api/resume
    @PutMapping
    public ResponseEntity<?> saveResume(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jsonContent = body.get("jsonContent");
        if (jsonContent == null) {
            jsonContent = "{}";
        }

        Resume resume = resumeRepository.findByUser(user)
                .orElse(Resume.builder().user(user).build());

        resume.setJsonContent(jsonContent);
        Resume saved = resumeRepository.save(resume);

        return ResponseEntity.ok(Map.of(
                "message", "Resume saved successfully",
                "id", saved.getId(),
                "updatedAt", saved.getUpdatedAt()
        ));
    }
}
