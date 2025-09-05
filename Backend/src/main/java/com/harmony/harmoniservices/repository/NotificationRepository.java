package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.enums.NotificationStatus;
import com.harmony.harmoniservices.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreationDateDesc(String recipientUserId);
    List<Notification> findByRecipientUserIdAndStatusOrderByCreationDateDesc(String recipientUserId, NotificationStatus status);
    long countByRecipientUserIdAndStatus(String recipientUserId, NotificationStatus status);
}
