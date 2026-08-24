package com.i2i.wattie.telemetry.service;

import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.telemetry.dto.TelemetryMessage;
import com.i2i.wattie.telemetry.model.HomeState;
import com.i2i.wattie.tariff.service.AnomalyRuleService;
import com.i2i.wattie.tariff.service.TariffRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;

import static com.i2i.wattie.telemetry.TelemetryConstants.SAMPLE_INTERVAL_SECONDS;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetryProcessingService {

    private static final BigDecimal SECONDS_PER_HOUR = BigDecimal.valueOf(3600);
    private static final BigDecimal WATTS_PER_KW = BigDecimal.valueOf(1000);

    private final HomeRepository homeRepository;
    private final IgniteStateService igniteStateService;
    private final TariffRuleService tariffRuleService;
    private final AnomalyRuleService anomalyRuleService;

    public void process(TelemetryMessage message) {
        Home home = homeRepository.findById(message.getHomeId()).orElse(null);
        if (home == null) {
            // Kayıtlı olmayan bir ev için telemetri geldiyse görmezden gel.
            return;
        }

        BigDecimal deltaKwh = message.getWatts()
                .multiply(BigDecimal.valueOf(SAMPLE_INTERVAL_SECONDS))
                .divide(SECONDS_PER_HOUR, MathContext.DECIMAL64)
                .divide(WATTS_PER_KW, MathContext.DECIMAL64);

        HomeState currentState = igniteStateService.getHomeState(message.getHomeId());
        boolean penaltyActive = currentState != null && currentState.isPenaltyActive();
        BigDecimal rate = penaltyActive ? home.getPenaltyTariffRate() : home.getNormalTariffRate();

        BigDecimal deltaCost = deltaKwh.multiply(rate);

        igniteStateService.recordConsumption(message.getHomeId(), deltaKwh, deltaCost);

        HomeState updatedState = igniteStateService.getHomeState(message.getHomeId());
        log.info("⚡ Telemetri Islendi -> Ev: {} | Cihaz: {} | Güç: {} W | Toplam: {} kWh | Maliyet: {} TL | Ceza: {}",
                home.getName(), message.getApplianceId(), message.getWatts(),
                updatedState != null ? updatedState.getTotalKwh() : 0,
                updatedState != null ? updatedState.getTotalCost() : 0,
                penaltyActive ? "AKTIF" : "PASIF");

        // Check tariff quota rules and anomaly rules
        tariffRuleService.checkQuota(message.getHomeId());
        anomalyRuleService.checkAppliance(message.getApplianceId(), message.getWatts());
    }
}