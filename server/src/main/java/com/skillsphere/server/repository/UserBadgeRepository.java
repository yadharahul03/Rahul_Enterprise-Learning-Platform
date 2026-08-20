package com.skillsphere.server.repository;

import com.skillsphere.server.model.Badge;
import com.skillsphere.server.model.User;
import com.skillsphere.server.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUser(User user);
    Optional<UserBadge> findByUserAndBadge(User user, Badge badge);
    boolean existsByUserAndBadge(User user, Badge badge);
}
