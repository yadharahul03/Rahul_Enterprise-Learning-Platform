package com.skillsphere.server.service;

import com.skillsphere.server.dto.NotificationDTO;
import com.skillsphere.server.model.User;

import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getUserNotifications(User user);
    NotificationDTO sendNotification(User user, String title, String message, String type);
    void markAsRead(Long notificationId, User user);
    void markAllAsRead(User user);
}
