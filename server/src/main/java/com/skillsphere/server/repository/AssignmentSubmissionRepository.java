package com.skillsphere.server.repository;

import com.skillsphere.server.model.Assignment;
import com.skillsphere.server.model.AssignmentSubmission;
import com.skillsphere.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignment(Assignment assignment);
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, User student);
    List<AssignmentSubmission> findByStudent(User student);
}
