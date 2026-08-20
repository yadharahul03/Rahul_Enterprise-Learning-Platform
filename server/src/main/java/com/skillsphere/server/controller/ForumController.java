package com.skillsphere.server.controller;

import com.skillsphere.server.model.*;
import com.skillsphere.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumThreadRepository threadRepository;

    @Autowired
    private ForumReplyRepository replyRepository;

    @Autowired
    private ForumUpvoteRepository upvoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    // GET /api/forum/threads?tag=...&courseId=...
    @GetMapping("/threads")
    public ResponseEntity<?> getThreads(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Long courseId,
            Authentication authentication) {

        User currentUser = null;
        if (authentication != null) {
            currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        List<ForumThread> threads;
        if (courseId != null) {
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            threads = courseOpt.map(threadRepository::findByCourseOrderByCreatedAtDesc)
                    .orElseGet(Collections::emptyList);
        } else if (tag != null && !tag.isBlank() && !"ALL".equalsIgnoreCase(tag)) {
            threads = threadRepository.findByTagOrderByCreatedAtDesc(tag);
        } else {
            threads = threadRepository.findAllByOrderByCreatedAtDesc();
        }

        User finalUser = currentUser;
        List<Map<String, Object>> response = threads.stream().map(thread -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", thread.getId());
            map.put("title", thread.getTitle());
            map.put("content", thread.getContent());
            map.put("tag", thread.getTag());
            map.put("authorName", thread.getAuthor().getName());
            map.put("authorRole", thread.getAuthor().getRole());
            map.put("authorId", thread.getAuthor().getId());
            map.put("courseId", thread.getCourse() != null ? thread.getCourse().getId() : null);
            map.put("courseTitle", thread.getCourse() != null ? thread.getCourse().getTitle() : null);
            map.put("createdAt", thread.getCreatedAt());
            map.put("upvotesCount", upvoteRepository.countByThread(thread));
            map.put("repliesCount", replyRepository.countByThread(thread));
            map.put("hasUpvoted", finalUser != null && upvoteRepository.existsByThreadAndUser(thread, finalUser));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // GET /api/forum/threads/{threadId}
    @GetMapping("/threads/{threadId}")
    public ResponseEntity<?> getThreadDetails(@PathVariable Long threadId, Authentication authentication) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);

        List<ForumReply> replies = replyRepository.findByThreadOrderByCreatedAtAsc(thread);
        List<Map<String, Object>> replyDTOs = replies.stream().map(r -> {
            Map<String, Object> rm = new LinkedHashMap<>();
            rm.put("id", r.getId());
            rm.put("content", r.getContent());
            rm.put("authorName", r.getAuthor().getName());
            rm.put("authorRole", r.getAuthor().getRole());
            rm.put("authorId", r.getAuthor().getId());
            rm.put("createdAt", r.getCreatedAt());
            return rm;
        }).collect(Collectors.toList());

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", thread.getId());
        details.put("title", thread.getTitle());
        details.put("content", thread.getContent());
        details.put("tag", thread.getTag());
        details.put("authorName", thread.getAuthor().getName());
        details.put("authorRole", thread.getAuthor().getRole());
        details.put("authorId", thread.getAuthor().getId());
        details.put("createdAt", thread.getCreatedAt());
        details.put("upvotesCount", upvoteRepository.countByThread(thread));
        details.put("hasUpvoted", currentUser != null && upvoteRepository.existsByThreadAndUser(thread, currentUser));
        details.put("replies", replyDTOs);

        return ResponseEntity.ok(details);
    }

    // POST /api/forum/threads
    @PostMapping("/threads")
    public ResponseEntity<?> createThread(@RequestBody Map<String, Object> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String title = (String) body.get("title");
        String content = (String) body.get("content");
        String tag = (String) body.get("tag");
        Long courseId = body.get("courseId") != null ? Long.valueOf(body.get("courseId").toString()) : null;

        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and content are required"));
        }

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId).orElse(null);
        }

        ForumThread thread = ForumThread.builder()
                .title(title)
                .content(content)
                .tag(tag != null && !tag.isBlank() ? tag : "GENERAL")
                .author(user)
                .course(course)
                .build();

        ForumThread saved = threadRepository.save(thread);
        return ResponseEntity.ok(Map.of("message", "Thread created successfully", "id", saved.getId()));
    }

    // POST /api/forum/threads/{threadId}/replies
    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<?> replyThread(@PathVariable Long threadId, @RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reply content cannot be empty"));
        }

        ForumReply reply = ForumReply.builder()
                .thread(thread)
                .author(user)
                .content(content)
                .build();

        replyRepository.save(reply);
        return ResponseEntity.ok(Map.of("message", "Reply added successfully"));
    }

    // POST /api/forum/threads/{threadId}/upvote
    @PostMapping("/threads/{threadId}/upvote")
    public ResponseEntity<?> toggleUpvote(@PathVariable Long threadId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        Optional<ForumUpvote> existing = upvoteRepository.findByThreadAndUser(thread, user);
        if (existing.isPresent()) {
            upvoteRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Upvote removed", "upvoted", false));
        } else {
            ForumUpvote upvote = ForumUpvote.builder()
                    .thread(thread)
                    .user(user)
                    .build();
            upvoteRepository.save(upvote);
            return ResponseEntity.ok(Map.of("message", "Upvoted successfully", "upvoted", true));
        }
    }
}
