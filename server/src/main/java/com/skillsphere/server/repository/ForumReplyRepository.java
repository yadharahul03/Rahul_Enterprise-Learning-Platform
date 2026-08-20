package com.skillsphere.server.repository;

import com.skillsphere.server.model.ForumReply;
import com.skillsphere.server.model.ForumThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumReplyRepository extends JpaRepository<ForumReply, Long> {
    List<ForumReply> findByThreadOrderByCreatedAtAsc(ForumThread thread);
    long countByThread(ForumThread thread);
}
