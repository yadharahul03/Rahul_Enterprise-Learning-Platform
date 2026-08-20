package com.skillsphere.server.repository;

import com.skillsphere.server.model.DailyActivity;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {
    List<DailyActivity> findByUserAndActivityDateBetweenOrderByActivityDateAsc(
            User user, LocalDate start, LocalDate end);

    List<DailyActivity> findByUser(User user);
    List<DailyActivity> findByUserAndActivityDateAfter(User user, LocalDate date);
    Optional<DailyActivity> findByUserAndActivityDate(User user, LocalDate date);
}