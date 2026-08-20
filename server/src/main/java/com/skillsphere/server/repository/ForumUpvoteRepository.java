package com.skillsphere.server.repository;

import com.skillsphere.server.model.ForumThread;
import com.skillsphere.server.model.ForumUpvote;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumUpvoteRepository extends JpaRepository<ForumUpvote, Long> {
    Optional<ForumUpvote> findByThreadAndUser(ForumThread thread, User user);
    long countByThread(ForumThread thread);
    boolean existsByThreadAndUser(ForumThread thread, User user);
}
