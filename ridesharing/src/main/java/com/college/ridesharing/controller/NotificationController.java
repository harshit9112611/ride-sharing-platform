package com.college.ridesharing.controller;

import com.college.ridesharing.dto.PushSubscriptionDTO;
import com.college.ridesharing.model.PushSubscription;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.PushSubscriptionRepository;
import com.college.ridesharing.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public NotificationController(PushSubscriptionRepository subscriptionRepository,
                                   UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscriptionDTO dto,
                                        Authentication auth) {
        try {
            if (!isValidSubscription(dto)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "A valid push subscription is required"));
            }

            User user = userRepository.findByCollegeEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<PushSubscription> existing = subscriptionRepository.findByEndpoint(dto.getEndpoint());
            if (existing.isPresent()) {
                PushSubscription subscription = existing.get();
                subscription.setUser(user);
                subscription.setP256dhKey(dto.getP256dh());
                subscription.setAuthKey(dto.getAuth());
                subscriptionRepository.save(subscription);

                return ResponseEntity.ok(Map.of("message", "Subscription updated"));
            }

            PushSubscription sub = new PushSubscription(
                    user, dto.getEndpoint(), dto.getP256dh(), dto.getAuth());
            subscriptionRepository.save(sub);

            return ResponseEntity.ok(Map.of("message", "Subscribed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody PushSubscriptionDTO dto,
                                          Authentication auth) {
        if (dto == null || dto.getEndpoint() == null || dto.getEndpoint().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "A subscription endpoint is required"));
        }

        User user = userRepository.findByCollegeEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        subscriptionRepository.findByEndpoint(dto.getEndpoint())
                .filter(subscription -> subscription.getUser().getId().equals(user.getId()))
                .ifPresent(subscriptionRepository::delete);

        return ResponseEntity.noContent().build();
    }

    private boolean isValidSubscription(PushSubscriptionDTO dto) {
        if (dto == null
                || dto.getEndpoint() == null || dto.getEndpoint().isBlank()
                || dto.getP256dh() == null || dto.getP256dh().isBlank()
                || dto.getAuth() == null || dto.getAuth().isBlank()) {
            return false;
        }

        try {
            URI endpoint = URI.create(dto.getEndpoint());
            return "https".equalsIgnoreCase(endpoint.getScheme())
                    && endpoint.getHost() != null;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
