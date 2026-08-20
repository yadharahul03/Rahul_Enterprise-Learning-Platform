package com.skillsphere.server.service;

import com.skillsphere.server.dto.BadgeDTO;
import com.skillsphere.server.model.User;

import java.util.List;

public interface BadgeService {
    List<BadgeDTO> getUserBadges(User user);
    void checkAndAwardBadges(User user);
    void awardBadge(User user, String badgeCode);
}
