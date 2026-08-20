package com.skillsphere.server.controller;

import com.skillsphere.server.dto.AiPromptRequest;
import com.skillsphere.server.dto.AiResponseDTO;
import com.skillsphere.server.dto.ApiResponse;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.UserRepository;
import com.skillsphere.server.service.AiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    @Autowired
    private AiAssistantService aiAssistantService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiResponseDTO>> queryAiAssistant(
            @RequestBody AiPromptRequest request,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AiResponseDTO response = aiAssistantService.processAiQuery(request, user);
        return ResponseEntity.ok(ApiResponse.success("AI response generated", response));
    }
}
