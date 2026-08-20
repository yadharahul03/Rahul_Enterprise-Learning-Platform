package com.skillsphere.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset your Enterprise Learning password");
        message.setText(
                "We received a request to reset your Enterprise Learning password.\n\n" +
                        "Click the link below to set a new password. This link expires in 30 minutes:\n\n" +
                        resetLink + "\n\n" +
                        "If you didn't request this, you can safely ignore this email."
        );

        mailSender.send(message);
    }

    public void sendCourseCompletionEmail(String toEmail, String userName, String courseTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("You completed " + courseTitle + " on Enterprise Learning!");
        message.setText(
                "Hi " + userName + ",\n\n" +
                        "Congratulations — you've completed every unit in \"" + courseTitle + "\".\n\n" +
                        "Your certificate is ready to view and download from My Learning:\n\n" +
                        frontendUrl + "/my-learning\n\n" +
                        "Nice work. Onward to the next route!"
        );
        mailSender.send(message);
    }

    public void sendLearningReminderEmail(String toEmail, String userName, String courseTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Continue Your Learning Journey");

        message.setText(
                "Hi " + userName + ",\n\n" +
                        "We noticed you haven't continued your course \"" + courseTitle + "\" for a few days.\n\n" +
                        "Continue your learning by logging into Enterprise Learning.\n\n" +
                        "Continue here: " + frontendUrl + "/my-learning\n\n" +
                        "Happy Learning!\n\n" +
                        "Team Enterprise Learning"
        );

        mailSender.send(message);
    }
}