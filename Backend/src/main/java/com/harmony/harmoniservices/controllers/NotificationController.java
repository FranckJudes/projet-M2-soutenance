package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.enums.NotificationStatus;
import com.harmony.harmoniservices.models.Notification;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.NotificationRepository;
import com.harmony.harmoniservices.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<UserEntity> user = userRepository.findByEmail(auth.getName());
        return user.isPresent() ? user.get().getId().toString() : null;
    }

    @GetMapping("/user/current")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        String userId = currentUserId();
        List<Notification> list = notificationRepository.findByRecipientUserIdOrderByCreationDateDesc(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/current/unread")
    public ResponseEntity<List<Notification>> getMyUnreadNotifications() {
        String userId = currentUserId();
        List<Notification> list = notificationRepository.findByRecipientUserIdAndStatusOrderByCreationDateDesc(userId, NotificationStatus.UNREAD);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/current/count")
    public ResponseEntity<Long> countMyUnreadNotifications() {
        String userId = currentUserId();
        long count = notificationRepository.countByRecipientUserIdAndStatus(userId, NotificationStatus.UNREAD);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        String userId = currentUserId();
        return notificationRepository.findById(id)
                .map(n -> {
                    if (!n.getRecipientUserId().equals(userId)) {
                        return ResponseEntity.status(403).body(ApiResponse.fail("Not allowed"));
                    }
                    n.setStatus(NotificationStatus.READ);
                    notificationRepository.save(n);
                    return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/user/current/read-all")
    public ResponseEntity<?> markAllAsRead() {
        String userId = currentUserId();
        List<Notification> list = notificationRepository.findByRecipientUserIdAndStatusOrderByCreationDateDesc(userId, NotificationStatus.UNREAD);
        list.forEach(n -> n.setStatus(NotificationStatus.READ));
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", list.size()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        String userId = currentUserId();
        return notificationRepository.findById(id)
                .map(n -> {
                    if (!n.getRecipientUserId().equals(userId)) {
                        return ResponseEntity.status(403).body(ApiResponse.fail("Not allowed"));
                    }
                    notificationRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
