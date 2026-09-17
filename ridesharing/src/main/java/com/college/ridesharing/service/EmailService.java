package com.college.ridesharing.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;
    private final String brevoApiKey;
    private final String senderEmail;
    private final String senderName;
    private final String frontendUrl;

    public EmailService(
            RestTemplate restTemplate,
            @Value("${brevo.api.key}") String brevoApiKey,
            @Value("${brevo.sender.email}") String senderEmail,
            @Value("${brevo.sender.name}") String senderName,
            @Value("${frontend.url}") String frontendUrl) {
        this.restTemplate = restTemplate;
        this.brevoApiKey = brevoApiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.frontendUrl = frontendUrl;
    }

    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verificationLink = frontendUrl + "/verify-email?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8);
        String safeName = HtmlUtils.htmlEscape(fullName);

        String html = """
                <h2>Welcome to LNCTShares, %s!</h2>
                <p>Please verify your email address to post rides.</p>
                <p><a href="%s" style="display:inline-block;padding:10px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:6px;">Verify your email</a></p>
                <p>This link expires in 24 hours.</p>
                """.formatted(safeName, verificationLink);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", senderEmail, "name", senderName),
                "to", List.of(Map.of("email", toEmail, "name", fullName)),
                "subject", "Verify your LNCTShares email",
                "htmlContent", html);

        restTemplate.postForEntity(
                BREVO_URL,
                new HttpEntity<>(body, headers),
                Void.class);
    }
}