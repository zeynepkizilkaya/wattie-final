package com.i2i.wattie.tariff.service;

import com.i2i.wattie.ai.service.AiNotificationService;
import com.i2i.wattie.home.entity.EventLog;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.telemetry.model.HomeState;
import com.i2i.wattie.telemetry.service.IgniteStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import static com.i2i.wattie.tariff.TariffConstants.QUOTA_PENALTY_THRESHOLD;
import static com.i2i.wattie.tariff.TariffConstants.QUOTA_WARNING_THRESHOLD;

@Slf4j
@Service
@RequiredArgsConstructor
public class TariffRuleService {

    private final IgniteStateService igniteStateService;
    private final HomeRepository homeRepository;
    private final EventLogRepository eventLogRepository;
    private final AiNotificationService aiNotificationService;

    @org.springframework.transaction.annotation.Transactional
    public void checkQuota(Long homeId) {
        if (homeId == null) return;

        HomeState homeState = igniteStateService.getHomeState(homeId);
        if (homeState == null) return;

        Home home = homeRepository.findById(homeId).orElse(null);
        if (home == null) return;

        if (home.getPowerQuotaKwh() == null || home.getFinancialQuota() == null ||
            home.getPowerQuotaKwh().compareTo(BigDecimal.ZERO) <= 0 ||
            home.getFinancialQuota().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal kwhRatio = homeState.getTotalKwh()
                .divide(home.getPowerQuotaKwh(), 4, RoundingMode.HALF_UP);
        BigDecimal costRatio = homeState.getTotalCost()
                .divide(home.getFinancialQuota(), 4, RoundingMode.HALF_UP);
        BigDecimal ratio = kwhRatio.max(costRatio);

        Optional<EventLog> lastEventOpt = eventLogRepository.findTopByHomeIdOrderByCreatedAtDesc(homeId);
        String lastEventType = lastEventOpt.map(EventLog::getEventType).orElse(null);

        if (ratio.compareTo(QUOTA_PENALTY_THRESHOLD) >= 0) {
            if ("QUOTA_100".equals(lastEventType) || "PENALTY_ACTIVATED".equals(lastEventType)) {
                return;
            }

            log.warn("Quota 100% exceeded for homeId {}. Ratio: {}. Activating penalty tariff.", homeId, ratio);
            igniteStateService.setPenaltyActive(homeId, true);

            EventLog quotaLog = new EventLog();
            quotaLog.setHome(home);
            quotaLog.setEventType("QUOTA_100");
            quotaLog.setDetails("Monthly consumption quota reached 100%. Ratio: " + ratio);
            eventLogRepository.save(quotaLog);

            EventLog penaltyLog = new EventLog();
            penaltyLog.setHome(home);
            penaltyLog.setEventType("PENALTY_ACTIVATED");
            penaltyLog.setDetails("Penalty tariff activated due to quota breach. Ratio: " + ratio);
            EventLog savedPenaltyLog = eventLogRepository.save(penaltyLog);

            aiNotificationService.notify(homeId, "PENALTY_ACTIVATED", savedPenaltyLog.getDetails(), savedPenaltyLog);

        } else if (ratio.compareTo(QUOTA_WARNING_THRESHOLD) >= 0) {
            if ("QUOTA_80".equals(lastEventType) || "QUOTA_100".equals(lastEventType) || "PENALTY_ACTIVATED".equals(lastEventType)) {
                return;
            }

            log.info("Quota 80% reached for homeId {}. Ratio: {}.", homeId, ratio);

            EventLog warningLog = new EventLog();
            warningLog.setHome(home);
            warningLog.setEventType("QUOTA_80");
            warningLog.setDetails("Monthly consumption reached 80% of quota. Ratio: " + ratio);
            EventLog savedWarningLog = eventLogRepository.save(warningLog);

            aiNotificationService.notify(homeId, "QUOTA_80", savedWarningLog.getDetails(), savedWarningLog);
        }
    }
}
