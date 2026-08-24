package com.i2i.wattie.common.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String REGISTRATION_TOPIC = "wattie.home.registration";
    public static final String TELEMETRY_TOPIC = "wattie.telemetry.data";

    @Bean
    public NewTopic registrationTopic() {
        return TopicBuilder.name(REGISTRATION_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic telemetryTopic() {
        return TopicBuilder.name(TELEMETRY_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}