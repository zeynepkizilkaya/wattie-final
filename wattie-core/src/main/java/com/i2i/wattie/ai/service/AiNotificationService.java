package com.i2i.wattie.ai.service;

import com.i2i.wattie.home.entity.EventLog;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiNotificationService {

    private final GeminiClientService geminiClientService;
    private final EmailService emailService;
    private final EventLogRepository eventLogRepository;
    private final HomeRepository homeRepository;

    @org.springframework.transaction.annotation.Transactional
    public void notify(Long homeId, String eventType, String details, EventLog eventLog) {
        log.info("Processing AI notification for homeId: {}, eventType: {}", homeId, eventType);

        // 1. Gemini / Fallback recommendation
        String recommendation = geminiClientService.getRecommendation(eventType, details);

        // 2. Update EventLog with aiRecommendation
        if (eventLog != null) {
            eventLog.setAiRecommendation(recommendation);
            eventLogRepository.save(eventLog);
        }

        // 3. Send Email Notification
        String recipientEmail = null;
        if (eventLog != null && eventLog.getHome() != null) {
            recipientEmail = eventLog.getHome().getContactEmail();
        } else if (homeId != null) {
            Home home = homeRepository.findById(homeId).orElse(null);
            if (home != null) {
                recipientEmail = home.getContactEmail();
            }
        }

        if (recipientEmail != null) {
            emailService.sendNotification(recipientEmail, eventType, recommendation);
        } else {
            log.warn("Could not find contact email for homeId: {}. Skipping email dispatch.", homeId);
        }
    }

    public void notify(Long homeId, String eventType, String details) {
        notify(homeId, eventType, details, null);
    }
}
