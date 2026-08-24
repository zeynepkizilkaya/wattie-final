package com.i2i.wattie.telemetry.consumer;

import com.i2i.wattie.telemetry.dto.TelemetryMessage;
import com.i2i.wattie.telemetry.service.TelemetryProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import static com.i2i.wattie.common.config.KafkaTopicConfig.TELEMETRY_TOPIC;

@Component
@RequiredArgsConstructor
public class TelemetryConsumer {

    private final TelemetryProcessingService telemetryProcessingService;

    @KafkaListener(topics = TELEMETRY_TOPIC, groupId = "wattie-core")
    public void consume(TelemetryMessage message) {
        telemetryProcessingService.process(message);
    }
}