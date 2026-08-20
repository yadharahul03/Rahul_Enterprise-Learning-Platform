package com.skillsphere.server.service;

import com.skillsphere.server.dto.BadgeDTO;
import com.skillsphere.server.model.Badge;
import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.model.User;
import com.skillsphere.server.model.UserBadge;
import com.skillsphere.server.repository.BadgeRepository;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.repository.UserBadgeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class BadgeServiceImpl implements BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @PostConstruct
    public void initDefaultBadges() {
        createBadgeIfAbsent("FIRST_COURSE", "First Course", "Enrolled in your first skill route on Enterprise Learning", "🎯");
        createBadgeIfAbsent("JAVA_EXPLORER", "Java Explorer", "Completed a Java or OOP mastery course", "☕");
        createBadgeIfAbsent("SPRING_EXPERT", "Spring Expert", "Completed a Spring Boot production backend course", "🍃");
        createBadgeIfAbsent("REACT_ROOKIE", "React Rookie", "Completed a React modern web engineering course", "⚛️");
        createBadgeIfAbsent("HOURS_100", "100 Hours Club", "Accumulated over 100 hours of active learning", "⏳");
        createBadgeIfAbsent("QUIZ_MASTER", "Quiz Master", "Scored a perfect 100% on a lesson quiz assessment", "🏆");
    }

    private void createBadgeIfAbsent(String code, String name, String description, String iconUrl) {
        if (badgeRepository.findByCode(code).isEmpty()) {
            Badge b = Badge.builder()
                    .code(code)
                    .name(name)
                    .description(description)
                    .iconUrl(iconUrl)
                    .build();
            badgeRepository.save(b);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BadgeDTO> getUserBadges(User user) {
        List<UserBadge> earnedBadges = userBadgeRepository.findByUser(user);
        Set<String> earnedCodes = earnedBadges.stream()
                .map(ub -> ub.getBadge().getCode())
                .collect(Collectors.toSet());

        return badgeRepository.findAll().stream().map(badge -> {
            boolean isEarned = earnedCodes.contains(badge.getCode());
            LocalDateTime earnedAt = isEarned
                    ? earnedBadges.stream().filter(ub -> ub.getBadge().getCode().equals(badge.getCode())).findFirst().get().getEarnedAt()
                    : null;

            return BadgeDTO.builder()
                    .id(badge.getId())
                    .code(badge.getCode())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .iconUrl(badge.getIconUrl())
                    .earned(isEarned)
                    .earnedAt(earnedAt)
                    .build();
        }).collect(Collectors.toList());
    }

    @Autowired
    private com.skillsphere.server.repository.DailyActivityRepository dailyActivityRepository;

    @Override
    public void checkAndAwardBadges(User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
        if (!enrollments.isEmpty()) {
            awardBadge(user, "FIRST_COURSE");
        }

        for (Enrollment e : enrollments) {
            boolean completed = e.getUnitsCompleted() >= e.getCourse().getTotalUnits();
            if (completed) {
                String cat = e.getCourse().getCategory() != null ? e.getCourse().getCategory().toUpperCase() : "";
                if (cat.contains("JAVA")) awardBadge(user, "JAVA_EXPLORER");
                if (cat.contains("SPRING")) awardBadge(user, "SPRING_EXPERT");
                if (cat.contains("REACT")) awardBadge(user, "REACT_ROOKIE");
            }
        }

        // Check for 100 Hours Club badge
        double totalHours = dailyActivityRepository.findByUser(user).stream()
                .mapToDouble(a -> a.getHoursSpent() != null ? a.getHoursSpent() : 0.0)
                .sum();
        if (totalHours >= 100.0) {
            awardBadge(user, "HOURS_100");
        }
    }

    @Override
    public void awardBadge(User user, String badgeCode) {
        Optional<Badge> badgeOpt = badgeRepository.findByCode(badgeCode);
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
                UserBadge userBadge = UserBadge.builder()
                        .user(user)
                        .badge(badge)
                        .earnedAt(LocalDateTime.now())
                        .build();
                userBadgeRepository.save(userBadge);
            }
        }
    }
}
