package com.i2i.wattie.ai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class GeminiClientServiceTest {

    private GeminiClientService geminiClientService;

    @BeforeEach
    void setUp() {
        geminiClientService = new GeminiClientService();
    }

    @Test
    void getRecommendation_withoutApiKey_shouldReturnFallbackText() {
        String result = geminiClientService.getRecommendation("QUOTA_80", "Details for quota warning");

        assertNotNull(result);
        assertTrue(result.contains("kotanızın %80'ine ulaştınız"));
    }

    @Test
    void getRecommendation_anomalyWithoutApiKey_shouldReturnAnomalyFallback() {
        String result = geminiClientService.getRecommendation("ANOMALY_DETECTED", "Appliance exceeded limit");

        assertNotNull(result);
        assertTrue(result.contains("beklenmedik güç tüketimi"));
    }
}
