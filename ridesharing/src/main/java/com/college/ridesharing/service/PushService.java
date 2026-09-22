package com.college.ridesharing.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.college.ridesharing.model.PushSubscription;
import com.college.ridesharing.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PushService {

    private static final Logger logger = LoggerFactory.getLogger(PushService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;
    private final String vapidPublicKey;
    private final String vapidPrivateKey;
    private final String vapidSubject;
    private nl.martijndwars.webpush.PushService webPushService;

    public PushService(
            PushSubscriptionRepository subscriptionRepository,
            ObjectMapper objectMapper,
            @Value("${vapid.public.key}") String vapidPublicKey,
            @Value("${vapid.private.key}") String vapidPrivateKey,
            @Value("${vapid.subject}") String vapidSubject) {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
        this.vapidPublicKey = vapidPublicKey;
        this.vapidPrivateKey = vapidPrivateKey;
        this.vapidSubject = vapidSubject;
    }

    @PostConstruct
    public void init() {
        try {
            if (vapidPublicKey.isBlank() || vapidPrivateKey.isBlank() || vapidSubject.isBlank()) {
                logger.error("Web Push service was not initialized because VAPID configuration is incomplete");
                return;
            }

            Security.addProvider(new BouncyCastleProvider());
            this.webPushService = new nl.martijndwars.webpush.PushService(
                    vapidPublicKey, vapidPrivateKey, vapidSubject);
            logger.info("Web Push service initialized");
        } catch (Exception e) {
            logger.error("Failed to initialize Web Push service: {}", e.getMessage());
        }
    }

    public void notifyNewRide(Long driverId, String source, String destination, String time) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", "New Ride Available");
        payload.put("body", source + " -> " + destination + " at " + time);
        payload.put("url", "https://lnctshares.vercel.app/rides/search");
        List<PushSubscription> subs = subscriptionRepository.findByUserIdNot(driverId);
        sendToSubscriptions(subs, payload);
    }

    public void notifyBookingAccepted(Long passengerId, String driverName, String source, String destination) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", "Booking Accepted");
        payload.put("body", driverName + " accepted your ride " + source + " -> " + destination);
        payload.put("url", "https://lnctshares.vercel.app/my-rides");
        List<PushSubscription> subs = subscriptionRepository.findByUserId(passengerId);
        sendToSubscriptions(subs, payload);
    }

    public void notifyNewBooking(Long driverId, String passengerName, String source, String destination) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", "New Booking Request");
        payload.put("body", passengerName + " booked your ride " + source + " -> " + destination);
        payload.put("url", "https://lnctshares.vercel.app/my-rides");
        List<PushSubscription> subs = subscriptionRepository.findByUserId(driverId);
        sendToSubscriptions(subs, payload);
    }

    private void sendToSubscriptions(List<PushSubscription> subscriptions, Map<String, Object> payload) {
        if (webPushService == null) {
            logger.warn("PushService not initialized. Skipping.");
            return;
        }
        if (subscriptions == null || subscriptions.isEmpty()) {
            logger.info("No subscriptions found for notification");
            return;
        }

        final String jsonPayload;
        try {
            jsonPayload = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize push notification payload: {}", e.getMessage());
            return;
        }

        for (PushSubscription sub : subscriptions) {
            Long userId = sub.getUser().getId();
            try {
                logger.info("Attempting push to user {}", userId);

                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dhKey(),
                        sub.getAuthKey(),
                        jsonPayload);
                HttpResponse response = webPushService.send(notification);
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode >= 200 && statusCode < 300) {
                    logger.info("✅ Push sent to user {}", userId);
                } else {
                    logger.warn("❌ Push failed for user {}: HTTP {}", userId, statusCode);
                    if (statusCode == 404 || statusCode == 410) {
                        subscriptionRepository.delete(sub);
                    }
                }
            } catch (Exception e) {
                logger.error("❌ Push failed for user {}: {}", userId, e.getMessage());
            }
        }
    }
}
