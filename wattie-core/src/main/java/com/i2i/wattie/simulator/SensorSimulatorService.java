package com.i2i.wattie.simulator;

import com.i2i.wattie.common.config.KafkaTopicConfig;
import com.i2i.wattie.home.entity.Appliance;
import com.i2i.wattie.home.repository.ApplianceRepository;
import com.i2i.wattie.telemetry.dto.TelemetryMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import static com.i2i.wattie.simulator.SimulatorConstants.ANOMALY_SPIKE_CHANCE_PERCENT;
import static com.i2i.wattie.simulator.SimulatorConstants.SIMULATOR_INTERVAL_MS;

@Slf4j
@Component
@Profile("simulator")
@RequiredArgsConstructor
public class SensorSimulatorService {

    private final ApplianceRepository applianceRepository;
    private final KafkaTemplate<String, TelemetryMessage> kafkaTemplate;

    @Scheduled(fixedRate = SIMULATOR_INTERVAL_MS)
    public void tick() {
        List<Appliance> appliances = applianceRepository.findAll();
        if (appliances.isEmpty()) {
            return;
        }

        log.debug("Sensor simulator tick. Simulating {} appliances...", appliances.size());

        for (Appliance appliance : appliances) {
            if (appliance.getHome() == null) continue;

            BigDecimal safeLimit = appliance.getSafeLimitWatts() != null ?
                    appliance.getSafeLimitWatts() : BigDecimal.valueOf(1000);

            boolean isSpike = ThreadLocalRandom.current().nextInt(100) < ANOMALY_SPIKE_CHANCE_PERCENT;
            double wattsVal;

            if (isSpike) {
                // Generate wattage spike (130% of safe limit)
                wattsVal = safeLimit.doubleValue() * 1.30;
                log.info("Simulator generating wattage SPIKE for appliance {} ({}): {} W",
                        appliance.getId(), appliance.getName(), wattsVal);
            } else {
                // Normal reading (70% of safe limit ±20% noise)
                double base = safeLimit.doubleValue() * 0.70;
                double noiseRatio = (ThreadLocalRandom.current().nextDouble() * 0.40) - 0.20; // [-0.20, +0.20]
                wattsVal = base * (1.0 + noiseRatio);
            }

            BigDecimal watts = BigDecimal.valueOf(wattsVal).setScale(2, RoundingMode.HALF_UP);

            TelemetryMessage message = new TelemetryMessage();
            message.setHomeId(appliance.getHome().getId());
            message.setApplianceId(appliance.getId());
            message.setWatts(watts);

            kafkaTemplate.send(KafkaTopicConfig.TELEMETRY_TOPIC, String.valueOf(message.getHomeId()), message);
        }
    }
}
