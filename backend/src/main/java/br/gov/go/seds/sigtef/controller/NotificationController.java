package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Notification;
import br.gov.go.seds.sigtef.repository.NotificationRepository;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        UUID userId = userDetails.getId();
        Page<Notification> notifications;

        if (Boolean.TRUE.equals(unreadOnly)) {
            notifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false, pageable);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        
        long count = notificationRepository.countByUserIdAndReadFalse(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !notification.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        notificationRepository.markAllAsReadForUser(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
