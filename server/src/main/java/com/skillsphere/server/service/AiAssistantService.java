package com.skillsphere.server.service;

import com.skillsphere.server.dto.AiPromptRequest;
import com.skillsphere.server.dto.AiResponseDTO;
import com.skillsphere.server.model.User;

public interface AiAssistantService {
    AiResponseDTO processAiQuery(AiPromptRequest request, User user);
}
