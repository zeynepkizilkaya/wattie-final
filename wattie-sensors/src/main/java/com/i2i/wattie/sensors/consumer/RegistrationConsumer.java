package com.i2i.wattie.sensors.consumer;

import com.i2i.wattie.sensors.dto.HomeRegisteredEvent;
import com.i2i.wattie.sensors.registry.ApplianceRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import static com.i2i.wattie.sensors.config.KafkaTopics.REGISTRATION_TOPIC;

@Component
@RequiredArgsConstructor
public class RegistrationConsumer {

    private final ApplianceRegistry applianceRegistry;

    @KafkaListener(topics = REGISTRATION_TOPIC, groupId = "wattie-sensors")
    public void consume(HomeRegisteredEvent event) {
        applianceRegistry.register(event);
    }
}