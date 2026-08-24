package com.i2i.wattie.sensors.simulator;

import com.i2i.wattie.sensors.dto.HomeRegisteredEvent;
import com.i2i.wattie.sensors.dto.TelemetryMessage;
import com.i2i.wattie.sensors.registry.ApplianceRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import static com.i2i.wattie.sensors.config.KafkaTopics.TELEMETRY_TOPIC;
import static com.i2i.wattie.sensors.config.SensorConstants.SAMPLE_INTERVAL_SECONDS;

@Component
@RequiredArgsConstructor
public class SensorSimulator {

    private final ApplianceRegistry applianceRegistry;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Scheduled(fixedRateString = "#{" + SAMPLE_INTERVAL_SECONDS + " * 1000}")
    public void generateReadings() {
        Map<Long, List<HomeRegisteredEvent.ApplianceInfo>> homes = applianceRegistry.getAllHomes();

        homes.forEach((homeId, appliances) -> {
            for (HomeRegisteredEvent.ApplianceInfo appliance : appliances) {
                BigDecimal watts = randomizedWatts(appliance.getSafeLimitWatts());

                TelemetryMessage message = new TelemetryMessage(homeId, appliance.getApplianceId(), watts);
                kafkaTemplate.send(TELEMETRY_TOPIC, homeId.toString(), message);
            }
        });
    }

    private BigDecimal randomizedWatts(BigDecimal safeLimit) {
        // Çoğunlukla normal aralıkta (%60-%95), zaman zaman limiti aşan (%100-%115)
        // değerler üretiyoruz ki anomali/ceza tarifesi senaryoları da test edilebilsin.
        double factor = ThreadLocalRandom.current().nextDouble(0.6, 1.15);
        return safeLimit.multiply(BigDecimal.valueOf(factor)).setScale(2, RoundingMode.HALF_UP);
    }
}