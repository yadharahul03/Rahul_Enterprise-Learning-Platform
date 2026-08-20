package com.skillsphere.server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsphere.server.dto.AiPromptRequest;
import com.skillsphere.server.dto.AiResponseDTO;
import com.skillsphere.server.model.User;
import com.skillsphere.server.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiAssistantServiceImpl implements AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantServiceImpl.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private com.skillsphere.server.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.skillsphere.server.repository.DailyActivityRepository dailyActivityRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AiResponseDTO processAiQuery(AiPromptRequest request, User user) {
        log.info("Gemini Key Loaded: {}", 
        geminiApiKey != null && !geminiApiKey.isEmpty());
        log.info("Gemini URL Loaded: {}", geminiApiUrl);
        String prompt = request.getPrompt() != null ? request.getPrompt().trim() : "";
        String type = request.getType() != null ? request.getType().toUpperCase() : "GENERAL";

        // Build real user enrollment context for personalized analysis
        String userContext = buildRealUserContext(user);

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String aiResponseText = callGeminiApi(prompt.isEmpty() ? "Provide a detailed " + type.toLowerCase() + " report based on my enrolled courses and progress." : prompt, type, user, userContext);
                if (aiResponseText != null && !aiResponseText.trim().isEmpty()) {
                    List<String> suggestions = generateDefaultSuggestions(type);
                    List<String> recommendedCourses = new ArrayList<>();
                    if ("RECOMMENDATION".equalsIgnoreCase(type) || "GENERAL".equalsIgnoreCase(type) || "SKILL_GAP".equalsIgnoreCase(type)) {
                        recommendedCourses.add("Spring Boot 3 REST API Production Development");
                        recommendedCourses.add("React 19 & Modern Web Development");
                        recommendedCourses.add("Data Structures & Algorithms in Java");
                    }
                    return AiResponseDTO.builder()
                            .response(aiResponseText)
                            .type(type)
                            .suggestions(suggestions)
                            .recommendedCourses(recommendedCourses)
                            .build();
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to template response. Error: {}", e.getMessage());
            }
        }

        return generateFallbackResponse(prompt, type, userContext, user);
    }

    private String buildRealUserContext(User user) {
        if (user == null) return "No user profile.";
        var enrollments = enrollmentRepository.findByUser(user);
        if (enrollments.isEmpty()) {
            return "User " + user.getName() + " is currently not enrolled in any course yet.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("User: ").append(user.getName()).append("\nEnrolled Courses:\n");
        for (var e : enrollments) {
            sb.append("- ").append(e.getCourse().getTitle())
              .append(" (Category: ").append(e.getCourse().getCategory())
              .append(", Progress: ").append(e.getUnitsCompleted()).append("/").append(e.getCourse().getTotalUnits()).append(" units)\n");
        }
        return sb.toString();
    }

    private String callGeminiApi(String prompt, String type, User user, String userContext) throws Exception {
        String userName = (user != null && user.getName() != null) ? user.getName() : "Student";
        String systemInstruction = "You are Enterprise Learning AI Assistant, an elite programming, software engineering, and learning tutor for student "
        + userName
        + ". Answer clearly and follow the requested output structure exactly.";

if ("ROADMAP".equalsIgnoreCase(type)) {
    systemInstruction += """

    For career roadmap requests, follow this EXACT format:

    Phase 1: Phase Name
    What to Learn: List of topics or skills to learn in this phase.
    Milestone: A clear milestone or achievement for this phase.
    Courses: List of recommended courses for this phase also check the users enrolled corses. If they have enrolled in any course then include that.
    Skills: In a tag manner

    Rules:
    - Generate the number of phases required based on the student's current skills, enrolled courses, and target role.
    Guidelines:
    - Make sure the phases gives the actual roadmap for the user to achieve the target role.
    - Each phase should represent a meaningful learning milestone.
    - Do not create unnecessary phases just to increase length.
    - Use only Phase headings.
    - Do not create Milestone headings.
    - Do not create tables.
    - Do not use italic formatting with single asterisks.
    - Do not wrap text with * or **.
    - Return plain text only.
    - Do not create Mermaid diagrams.
    - Do not use code blocks.
    - Do not add introduction or conclusion.
    - Do not add conversational messages.
    - All the skills will be passed to the boldMatches section
    - The response will be directly converted into UI cards, so maintain this structure.
    """;
}
        
        String combinedPrompt = systemInstruction + "\n\nUser Learning Context:\n" + userContext + "\n\nQuery Type: " + type + "\nUser Question / Prompt: " + prompt;

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", combinedPrompt);

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(textPart);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", parts);

        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(contentMap);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String fullUrl = geminiApiUrl + "?key=" + geminiApiKey.trim();
        ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode partsNode = candidates.get(0).path("content").path("parts");
                if (partsNode.isArray() && partsNode.size() > 0) {
                    return partsNode.get(0).path("text").asText();
                }
            }
        }
        return null;
    }

    private List<String> generateDefaultSuggestions(String type) {
        List<String> suggestions = new ArrayList<>();
        switch (type) {
            case "EXPLAIN_CONCEPT":
                suggestions.add("Can you provide a code example?");
                suggestions.add("How does this perform under high concurrency?");
                break;
            case "EXPLAIN_CODE":
                suggestions.add("How to optimize memory usage?");
                suggestions.add("Add unit test cases with Mockito");
                break;
            case "INTERVIEW_PREP":
                suggestions.add("Give me 3 more interview questions");
                suggestions.add("Explain Virtual Threads in Java 21");
                break;
            case "GENERATE_QUIZ":
                suggestions.add("Show detailed answer explanations");
                suggestions.add("Generate 5 more questions");
                break;
            default:
                suggestions.add("Explain with a real-world project example");
                suggestions.add("What are the best practices for this topic?");
                break;
        }
        return suggestions;
    }

    private AiResponseDTO generateFallbackResponse(String prompt, String type, String context, User user) {
        StringBuilder sb = new StringBuilder();
        List<String> suggestions = new ArrayList<>();
        List<String> recommendedCourses = new ArrayList<>();
        String actualContext = context != null ? context : "Full Stack Development";

        switch (type) {
            case "EXPLAIN_CONCEPT":
                sb.append("### 💡 Concept Explanation: ").append(prompt.isEmpty() ? "Software Architecture" : prompt).append("\n\n");
                sb.append("In modern engineering, **").append(prompt.isEmpty() ? "this concept" : prompt).append("** is a fundamental building block. ");
                sb.append("It provides structural clarity, modular decoupling, and scalable code organization.\n\n");
                sb.append("**Key Takeaways:**\n");
                sb.append("1. **Modularity**: Keeps components isolated with clear single responsibilities.\n");
                sb.append("2. **Scalability**: Enables high-throughput async processing and clean testing.\n");
                sb.append("3. **Production Utility**: Widely adopted across enterprise Java & React production environments.");
                suggestions.add("Can you provide a code example?");
                suggestions.add("How does this perform under high concurrency?");
                break;

            case "SUMMARY":
                sb.append("### 📝 Topic Summary\n\n");
                sb.append("Here is your executive summary for **").append(prompt.isEmpty() ? actualContext : prompt).append("**:\n");
                sb.append("- **Core Focus**: Mastered key foundational syntax, lifecycle patterns, and architectural flows.\n");
                sb.append("- **Pragmatic Application**: Building REST API endpoints with Spring Boot and React Hooks integration.\n");
                sb.append("- **Next Objective**: Complete practical quiz assessments and earn your official certification.");
                suggestions.add("Generate a quick self-check quiz");
                suggestions.add("Recommend next advanced route");
                break;

            case "EXPLAIN_CODE":
                sb.append("### 🔍 Code Walkthrough & Analysis\n\n");
                sb.append("Here is the breakdown for your code snippet:\n");
                sb.append("```java\n// Code structure analyzed cleanly\n");
                sb.append(prompt.isEmpty() ? "// Select target code block" : prompt).append("\n```\n\n");
                sb.append("**Analysis:**\n");
                sb.append("- **Time Complexity**: O(N) linear time processing.\n");
                sb.append("- **Memory Overhead**: O(1) auxiliary memory utilization.\n");
                sb.append("- **Best Practice Tip**: Ensure null checks and use Optional/Records where appropriate.");
                suggestions.add("How to optimize memory usage?");
                suggestions.add("Add unit test cases with Mockito");
                break;

            case "INTERVIEW_PREP":
                sb.append("### 🎯 Technical Interview Preparation\n\n");
                sb.append("**Target Focus**: ").append(prompt.isEmpty() ? "Java & Spring Boot Core" : prompt).append("\n\n");
                sb.append("**Top 3 Expected Technical Questions:**\n");
                sb.append("1. **Question**: Explain how Spring Security filters process JWT Bearer tokens statelessly.\n");
                sb.append("   *Answer*: JWT filters intercept HTTP requests, validate signature claims, extract identity, and set `GrantedAuthorities` into `SecurityContextHolder`.\n");
                sb.append("2. **Question**: What is the difference between `@Component`, `@Service`, and `@Repository` in Spring?\n");
                sb.append("   *Answer*: They are specialized `@Component` stereotypes providing semantic clarity and automatic exception translation at the DAO layer.\n");
                sb.append("3. **Question**: How do React Virtual DOM diffing algorithms optimize render cycles?\n");
                sb.append("   *Answer*: React constructs lightweight virtual DOM trees, compares diff nodes, and batches minimal DOM updates to the actual browser tree.");
                suggestions.add("Give me 3 more interview questions");
                suggestions.add("Explain Virtual Threads in Java 21");
                break;

            case "GENERATE_QUIZ":
                sb.append("### 🧪 Practice Knowledge Check\n\n");
                sb.append("**Question 1**: Which annotation marks a class as a global REST controller advice for handling exceptions in Spring Boot?\n");
                sb.append("- A) `@ControllerAdvice` / `@RestControllerAdvice` ✅\n");
                sb.append("- B) `@Service` \n- C) `@Repository` \n- D) `@EnableScheduling` \n\n");
                sb.append("**Question 2**: What hook in React handles side effects like data fetching or subscriptions?\n");
                sb.append("- A) `useState` \n- B) `useEffect` ✅\n- C) `useMemo` \n- D) `useRef`");
                suggestions.add("Show detailed answer explanations");
                suggestions.add("Generate 5 more questions");
                break;

            case "DOUBT":
                sb.append("### ❓ Custom Query Received: ").append(prompt.isEmpty() ? "Programming Question" : prompt).append("\n\n");
                sb.append("To enable **real-time AI answers** for custom queries, your Google Gemini API key needs to be configured.\n\n");
                sb.append("**How to enable real AI responses:**\n");
                sb.append("1. Obtain a free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).\n");
                sb.append("2. Open `server/src/main/resources/application.properties`.\n");
                sb.append("3. Add: `gemini.api.key=YOUR_ACTUAL_GEMINI_API_KEY`.\n");
                sb.append("4. Restart the Spring Boot server.\n\n");
                sb.append("*Once added, Enterprise Learning AI will answer any question dynamically using Google Gemini 1.5 Flash!*");
                suggestions.add("Explain Spring Boot REST annotations");
                suggestions.add("Explain React Virtual DOM diffing");
                break;

            case "RECOMMENDATION":
            default:
                if (!prompt.isEmpty()) {
                    sb.append("### 🤖 Enterprise Learning Assistant\n\n");
                    sb.append("Received prompt: **\"").append(prompt).append("\"**\n\n");
                    sb.append("⚠️ *Real AI model response requires a Google Gemini API Key.* Please set `gemini.api.key` in `application.properties` to receive live dynamic AI answers for custom questions.");
                } else {
                    sb.append("### 🌟 Recommended Learning Paths for ").append(user.getName().split(" ")[0]).append("\n\n");
                    sb.append("Based on your learning activity, here are top recommended skill routes:\n\n");
                    sb.append("1. **Spring Boot 3 REST API Production Development** — Perfect for building enterprise backends.\n");
                    sb.append("2. **React 19 & Modern Web Development** — Master modern SPA frontend engineering.\n");
                    sb.append("3. **Data Structures & Algorithms in Java** — Ace technical coding interviews.");

                    recommendedCourses.add("Spring Boot 3 REST API Production Development");
                    recommendedCourses.add("React 19 & Modern Web Development");
                    recommendedCourses.add("Data Structures & Algorithms in Java");
                }

                suggestions.add("Tell me more about Spring Boot 3");
                suggestions.add("How do I earn my certification?");
                break;

        }

        return AiResponseDTO.builder()
                .response(sb.toString())
                .type(type)
                .suggestions(suggestions)
                .recommendedCourses(recommendedCourses)
                .build();
    }
}

