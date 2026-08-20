package com.skillsphere.server.repository;

import com.skillsphere.server.model.Lesson;
import com.skillsphere.server.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByLesson(Lesson lesson);
}