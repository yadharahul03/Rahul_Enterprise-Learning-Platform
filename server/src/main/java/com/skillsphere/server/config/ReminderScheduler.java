package com.skillsphere.server.config;

import com.skillsphere.server.model.Enrollment;
import com.skillsphere.server.repository.EnrollmentRepository;
import com.skillsphere.server.service.EmailService;
import com.skillsphere.server.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    // Runs daily at 9:00 AM to process automated learning reminders
    @Scheduled(cron = "0 0 9 * * ?")
    public void processStudyReminders() {
        log.info("[Spring Scheduler] Running automated study reminder check...");

        List<Enrollment> enrollments = enrollmentRepository.findAll();
        int count = 0;

        for (Enrollment e : enrollments) {
            boolean incomplete = e.getUnitsCompleted() < e.getCourse().getTotalUnits();
            boolean idle = e.getLastAccessed() != null && e.getLastAccessed().isBefore(LocalDateTime.now().minusDays(3));

            if (incomplete && idle) {
                notificationService.sendNotification(
                        e.getUser(),
                        "Resume your learning trail in " + e.getCourse().getTitle(),
                        "You have uncompleted lessons waiting in " + e.getCourse().getTitle() + ". Continue where you left off!",
                        "REMINDER"
                );

                try {
                    emailService.sendLearningReminderEmail(
                            e.getUser().getEmail(),
                            e.getUser().getName(),
                            e.getCourse().getTitle()
                    );
                } catch (Exception ex) {
                    log.warn("Failed to dispatch study reminder email to {}: {}", e.getUser().getEmail(), ex.getMessage());
                }

                count++;
            }
        }

        log.info("[Spring Scheduler] Automated check complete. Dispatched {} study reminders.", count);
    }
}
