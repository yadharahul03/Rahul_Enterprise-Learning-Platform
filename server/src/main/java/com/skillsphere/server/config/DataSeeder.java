package com.skillsphere.server.config;

import com.skillsphere.server.model.*;
import com.skillsphere.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        seedMasterAdminUser();

        // Seed additional demo items if empty
        seedDemoEntities();

        if (courseRepository.count() > 0) {
            return; // Courses table is already populated
        }

        System.out.println("[DataSeeder] Courses table empty. Populating 25+ realistic demo courses across 10 categories...");

        // 1. Java Category
        seedCourseWithLessons("Core Java 21 Masterclass", "Java", "BEGINNER", 24,
                "Master modern Java 21 syntax, OOP principles, Records, Pattern Matching, Virtual Threads, and collections.");

        seedCourseWithLessons("Advanced Java & Concurrent Programming", "Java", "ADVANCED", 32,
                "Deep dive into Java memory model, multi-threading, CompletableFuture, Virtual Threads, and JVM tuning.");

        // 2. Spring Boot Category
        seedCourseWithLessons("Spring Boot 3 REST API Production Development", "Spring Boot", "INTERMEDIATE", 28,
                "Build enterprise-grade REST APIs with Spring Boot 3, Spring Security, JWT authentication, and MySQL JPA.");

        seedCourseWithLessons("Microservices Architecture with Spring Cloud", "Spring Boot", "ADVANCED", 36,
                "Architect scalable microservices with API Gateways, Eureka Service Discovery, Spring Cloud Config, and Resilience4j.");

        // 3. React Category
        seedCourseWithLessons("React 19 & Modern Web Development", "React", "BEGINNER", 20,
                "Learn component architecture, React Hooks, State Management, React Router v7, and custom hooks.");

        seedCourseWithLessons("Advanced React Performance & State Patterns", "React", "ADVANCED", 26,
                "Master render optimization, Redux Toolkit, React Query, Zustand, compound components, and SSR with Next.js.");

        // 4. Python Category
        seedCourseWithLessons("Python 3 Programming Bootcamp", "Python", "BEGINNER", 18,
                "Complete guide to Python from scratch: data structures, object-oriented design, functional features, and file I/O.");

        seedCourseWithLessons("Python for Data Science & Automation", "Python", "INTERMEDIATE", 25,
                "Automate tasks and analyze datasets using Python, Pandas, NumPy, Matplotlib, and web scraping with BeautifulSoup.");

        // 5. SQL Category
        seedCourseWithLessons("Relational Database Design & SQL Mastery", "SQL", "BEGINNER", 16,
                "Learn database normalization, complex SQL joins, indexing strategies, CTEs, and query execution plans in MySQL.");

        seedCourseWithLessons("Advanced SQL Query Optimization & DB Tuning", "SQL", "ADVANCED", 22,
                "Optimize high-throughput relational databases, analyze query execution trees, partition tables, and tune indexes.");

        // 6. AWS Category
        seedCourseWithLessons("AWS Certified Solutions Architect Associate", "AWS", "INTERMEDIATE", 35,
                "Hands-on cloud architecture covering EC2, S3, RDS, Lambda, VPC networking, IAM security, and Auto Scaling.");

        seedCourseWithLessons("Serverless Applications with AWS Lambda & DynamoDB", "AWS", "ADVANCED", 22,
                "Build fully serverless REST APIs using AWS Lambda, API Gateway, DynamoDB, EventBridge, and AWS SAM.");

        // 7. Docker Category
        seedCourseWithLessons("Docker Containers for Beginners", "Docker", "BEGINNER", 14,
                "Containerize applications with Docker, multi-stage Dockerfiles, Docker Compose, volume persistent storage, and networking.");

        seedCourseWithLessons("Docker & Kubernetes Container Orchestration", "Docker", "ADVANCED", 30,
                "Deploy and orchestrate containerized applications at scale using Kubernetes pods, deployments, services, and Helm charts.");

        // 8. Git Category
        seedCourseWithLessons("Git & GitHub Complete Version Control", "Git", "BEGINNER", 10,
                "Master Git workflow: branching, merging, interactive rebase, pull requests, cherry-picking, and resolving merge conflicts.");

        seedCourseWithLessons("CI/CD Automation with GitHub Actions", "Git", "INTERMEDIATE", 15,
                "Automate test suites, security vulnerability scanning, docker builds, and cloud deployments with GitHub Actions.");

        // 9. DSA (Data Structures & Algorithms) Category
        seedCourseWithLessons("Data Structures & Algorithms in Java", "DSA", "INTERMEDIATE", 45,
                "Ace technical coding interviews: Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and Big-O Analysis.");

        seedCourseWithLessons("Competitive Programming & Advanced Algorithms", "DSA", "ADVANCED", 50,
                "Master advanced graph algorithms, Segment Trees, Disjoint Set Union (DSU), Trie, and dynamic programming tricks.");

        // 10. AI & Machine Learning Category
        seedCourseWithLessons("Artificial Intelligence & Machine Learning Fundamentals", "AI", "INTERMEDIATE", 30,
                "Comprehensive overview of supervised & unsupervised learning, regression, classification, Decision Trees, and Scikit-Learn.");

        seedCourseWithLessons("Generative AI & LLM Application Development", "AI", "ADVANCED", 28,
                "Build AI applications with Large Language Models (LLMs), LangChain, Vector Databases (Pinecone/Chroma), and RAG pipelines.");

        // 11. Extra Elective Courses for Catalog Depth
        seedCourseWithLessons("Full Stack Development with Spring Boot & React", "Java", "INTERMEDIATE", 40,
                "Build end-to-end full stack web applications integrating a React SPA with a secure Java Spring Boot REST API.");

        seedCourseWithLessons("TypeScript for Enterprise React Applications", "React", "INTERMEDIATE", 18,
                "Write type-safe React applications using TypeScript generics, utility types, and strict mode practices.");

        seedCourseWithLessons("Clean Code & Software Architecture Design", "Java", "INTERMEDIATE", 16,
                "Learn SOLID principles, Design Patterns, Refactoring, Unit Testing with JUnit 5 & Mockito, and Clean Architecture.");

        seedCourseWithLessons("Restful API Design & OpenAPI Documentation", "Spring Boot", "BEGINNER", 12,
                "Design clean REST endpoints, version APIs, handle pagination, and generate documentation with Swagger / OpenAPI.");

        seedCourseWithLessons("Linux System Administration & Shell Scripting", "Docker", "BEGINNER", 20,
                "Master Linux CLI commands, permissions, systemd services, process management, and bash shell automation scripting.");

        System.out.println("[DataSeeder] Successfully seeded 25 realistic demo courses with lessons and quizzes!");
    }

    private void seedMasterAdminUser() {
        if (userRepository.findByEmail("admin@skillsphere.com").isEmpty()) {
            User admin = User.builder()
                    .name("Platform Admin")
                    .email("admin@skillsphere.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .provider("LOCAL")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            System.out.println("[DataSeeder] Master Admin account seeded: admin@skillsphere.com / admin123");
        }
    }

    private void seedCourseWithLessons(String title, String category, String difficulty, int durationHours, String description) {
        Course course = new Course();
        course.setTitle(title);
        course.setCategory(category);
        course.setDifficulty(difficulty);
        course.setDurationHours(durationHours);
        course.setDescription(description);
        course.setTotalUnits(4);
        course.setPublished(true);
        course.setThumbnailUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60");
        Course savedCourse = courseRepository.save(course);

        // Add 4 realistic units/lessons per course
        Lesson l1 = new Lesson();
        l1.setCourse(savedCourse);
        l1.setTitle("1. Course Introduction & Core Concepts");
        l1.setType(LessonType.VIDEO);
        l1.setOrderIndex(1);
        l1.setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
        lessonRepository.save(l1);

        Lesson l2 = new Lesson();
        l2.setCourse(savedCourse);
        l2.setTitle("2. Fundamentals & Architecture Overview");
        l2.setType(LessonType.READING);
        l2.setOrderIndex(2);
        l2.setContent("In this module, we explore the essential foundational concepts behind " + title + ". Understand key terminology, operational flow, and best practices used by senior engineers.");
        lessonRepository.save(l2);

        Lesson l3 = new Lesson();
        l3.setCourse(savedCourse);
        l3.setTitle("3. Hands-on Implementation & Code Examples");
        l3.setType(LessonType.READING);
        l3.setOrderIndex(3);
        l3.setContent("Building practical projects is the best way to master " + title + ". Review the code structures below and practice building component blocks step by step.");
        lessonRepository.save(l3);

        Lesson l4 = new Lesson();
        l4.setCourse(savedCourse);
        l4.setTitle("4. Knowledge Assessment Quiz");
        l4.setType(LessonType.QUIZ);
        l4.setOrderIndex(4);
        Lesson savedQuizLesson = lessonRepository.save(l4);

        // Add sample quiz question
        QuizQuestion q = new QuizQuestion();
        q.setLesson(savedQuizLesson);
        q.setQuestionText("What is the primary benefit of mastering " + title + "?");
        q.setOptionA("Building production-ready software efficiently");
        q.setOptionB("Eliminating the need for automated testing");
        q.setOptionC("Bypassing relational database normalization");
        q.setOptionD("Avoiding version control systems");
        q.setCorrectOption(0);
        quizQuestionRepository.save(q);
    }

    @Autowired
    private com.skillsphere.server.repository.InternshipRepository internshipRepository;

    private void seedDemoEntities() {
        if (internshipRepository.count() == 0) {
            internshipRepository.save(Internship.builder()
                    .title("Full Stack Java & React Intern")
                    .company("Nexus Tech Solutions")
                    .location("Remote")
                    .type("REMOTE")
                    .description("Join our engineering team to build scalable microservices and dynamic React SPAs.")
                    .applyUrl("https://careers.nexus.example.com/apply/101")
                    .active(true)
                    .build());

            internshipRepository.save(Internship.builder()
                    .title("Backend Software Engineer Apprentice")
                    .company("CloudScale Systems")
                    .location("Hybrid (New York, NY)")
                    .type("HYBRID")
                    .description("Hands-on experience with Spring Cloud, Docker containerization, and AWS deployment.")
                    .applyUrl("https://careers.cloudscale.example.com/jobs/backend-apprentice")
                    .active(true)
                    .build());
        }
    }
}
