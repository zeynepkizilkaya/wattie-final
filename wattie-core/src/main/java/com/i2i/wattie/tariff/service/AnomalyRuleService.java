package com.i2i.wattie.tariff.service;

import com.i2i.wattie.ai.service.AiNotificationService;
import com.i2i.wattie.home.entity.Appliance;
import com.i2i.wattie.home.entity.EventLog;
import com.i2i.wattie.home.repository.ApplianceRepository;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.tariff.model.ApplianceBreachState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ignite.client.ClientCache;
import org.apache.ignite.client.IgniteClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import static com.i2i.wattie.tariff.TariffConstants.ANOMALY_CONSECUTIVE_BREACHES;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnomalyRuleService {

    private static final String CACHE_NAME = "applianceBreachStates";

    private final IgniteClient igniteClient;
    private final ApplianceRepository applianceRepository;
    private final EventLogRepository eventLogRepository;
    private final AiNotificationService aiNotificationService;

    private ClientCache<Long, ApplianceBreachState> cache() {
        return igniteClient.getOrCreateCache(CACHE_NAME);
    }

    @org.springframework.transaction.annotation.Transactional
    public void checkAppliance(Long applianceId, BigDecimal currentWatts) {
        if (applianceId == null || currentWatts == null) return;

        Appliance appliance = applianceRepository.findById(applianceId).orElse(null);
        if (appliance == null || appliance.getSafeLimitWatts() == null) return;

        ClientCache<Long, ApplianceBreachState> breachCache = cache();
        ApplianceBreachState state = breachCache.get(applianceId);
        if (state == null) {
            state = new ApplianceBreachState(applianceId, 0, false);
        }

        if (currentWatts.compareTo(appliance.getSafeLimitWatts()) > 0) {
            state.setConsecutiveBreaches(state.getConsecutiveBreaches() + 1);
        } else {
            state.setConsecutiveBreaches(0);
            state.setAnomalyFlagged(false);
        }

        if (state.getConsecutiveBreaches() >= ANOMALY_CONSECUTIVE_BREACHES && !state.isAnomalyFlagged()) {
            state.setAnomalyFlagged(true);
            log.warn("Anomaly detected for applianceId {} ({}). Current watts: {}, safe limit: {}",
                    applianceId, appliance.getName(), currentWatts, appliance.getSafeLimitWatts());

            EventLog eventLog = new EventLog();
            eventLog.setHome(appliance.getHome());
            eventLog.setEventType("ANOMALY_DETECTED");
            eventLog.setDetails(String.format("Appliance %d (%s) exceeded safe limit (%s W) for 3 consecutive cycles (%s W)",
                    applianceId, appliance.getName(), appliance.getSafeLimitWatts(), currentWatts));
            EventLog savedLog = eventLogRepository.save(eventLog);

            Long homeId = appliance.getHome() != null ? appliance.getHome().getId() : null;
            aiNotificationService.notify(homeId, "ANOMALY_DETECTED", savedLog.getDetails(), savedLog);
        }

        breachCache.put(applianceId, state);
    }
}
