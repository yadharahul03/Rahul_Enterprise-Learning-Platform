package com.skillsphere.server.repository;

import com.skillsphere.server.model.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByActiveTrueOrderByPostedAtDesc();
    List<Internship> findAllByOrderByPostedAtDesc();
}
