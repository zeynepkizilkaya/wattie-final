package com.i2i.wattie.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotification(String toEmail, String eventType, String recommendationText) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Recipient email is empty, skipping email notification for event: {}", eventType);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Wattie Bildirimi: " + eventType);
            message.setText(recommendationText);
            mailSender.send(message);
            log.info("Notification email sent successfully to {} for event: {}", toEmail, eventType);
        } catch (Exception e) {
            log.error("Failed to send notification email to {} for event: {}. Reason: {}",
                    toEmail, eventType, e.getMessage());
        }
    }
}
