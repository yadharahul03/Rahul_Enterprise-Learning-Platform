package com.skillsphere.server.controller;

import com.skillsphere.server.model.Internship;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.InternshipRepository;
import com.skillsphere.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/internships
    @GetMapping
    public ResponseEntity<?> getInternships() {
        List<Internship> list = internshipRepository.findByActiveTrueOrderByPostedAtDesc();
        return ResponseEntity.ok(list);
    }

    // POST /api/internships (Admin or Instructor only)
    @PostMapping
    public ResponseEntity<?> createInternship(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !"INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only Admin or Instructors can post internship opportunities"));
        }

        String title = body.get("title");
        String company = body.get("company");
        String location = body.get("location");
        String type = body.get("type");
        String description = body.get("description");
        String applyUrl = body.get("applyUrl");

        if (title == null || company == null || applyUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, company, and applyUrl are required"));
        }

        Internship internship = Internship.builder()
                .title(title)
                .company(company)
                .location(location != null ? location : "Remote")
                .type(type != null ? type : "REMOTE")
                .description(description != null ? description : "")
                .applyUrl(applyUrl)
                .active(true)
                .build();

        Internship saved = internshipRepository.save(internship);
        return ResponseEntity.ok(Map.of("message", "Internship posted successfully", "id", saved.getId()));
    }

    // DELETE /api/internships/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !"INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        internshipRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Internship listing removed"));
    }
}
