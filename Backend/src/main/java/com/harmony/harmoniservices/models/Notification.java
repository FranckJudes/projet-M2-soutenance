package com.harmony.harmoniservices.models;

import com.harmony.harmoniservices.enums.NotificationPriority;
import com.harmony.harmoniservices.enums.NotificationStatus;
import com.harmony.harmoniservices.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientUserId; // ID utilisateur applicatif

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(nullable = false)
    private LocalDateTime creationDate;

    private String sourceId;    // e.g. taskId, processInstanceId
    private String sourceType;  // e.g. TaskInstance, WorkflowInstance
    private String actionUrl;   // deep link in the app

    @Lob
    private String extra;       // JSON ext
}
