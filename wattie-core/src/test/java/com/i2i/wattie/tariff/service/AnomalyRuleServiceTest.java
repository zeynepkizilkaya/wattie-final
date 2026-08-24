package com.i2i.wattie.tariff.service;

import com.i2i.wattie.ai.service.AiNotificationService;
import com.i2i.wattie.home.entity.Appliance;
import com.i2i.wattie.home.entity.EventLog;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.ApplianceRepository;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.tariff.model.ApplianceBreachState;
import org.apache.ignite.client.ClientCache;
import org.apache.ignite.client.IgniteClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnomalyRuleServiceTest {

    @Mock
    private IgniteClient igniteClient;

    @Mock
    private ClientCache<Long, ApplianceBreachState> cache;

    @Mock
    private ApplianceRepository applianceRepository;

    @Mock
    private EventLogRepository eventLogRepository;

    @Mock
    private AiNotificationService aiNotificationService;

    @InjectMocks
    private AnomalyRuleService anomalyRuleService;

    private Appliance testAppliance;
    private Home testHome;

    @BeforeEach
    void setUp() {
        testHome = new Home();
        testHome.setId(10L);
        testHome.setContactEmail("owner@home.com");

        testAppliance = new Appliance();
        testAppliance.setId(100L);
        testAppliance.setName("Heater");
        testAppliance.setSafeLimitWatts(new BigDecimal("1500.00"));
        testAppliance.setHome(testHome);

        lenient().when(igniteClient.<Long, ApplianceBreachState>getOrCreateCache("applianceBreachStates")).thenReturn(cache);
    }

    @Test
    void checkAppliance_whenUnderLimit_shouldResetConsecutiveBreaches() {
        ApplianceBreachState existingState = new ApplianceBreachState(100L, 2, false);

        when(applianceRepository.findById(100L)).thenReturn(Optional.of(testAppliance));
        when(cache.get(100L)).thenReturn(existingState);

        anomalyRuleService.checkAppliance(100L, new BigDecimal("1200.00"));

        verify(cache).put(eq(100L), argThat(state -> state.getConsecutiveBreaches() == 0));
        verify(eventLogRepository, never()).save(any());
    }

    @Test
    void checkAppliance_when3ConsecutiveBreaches_shouldTriggerAnomalyDetectedEvent() {
        ApplianceBreachState existingState = new ApplianceBreachState(100L, 2, false);

        when(applianceRepository.findById(100L)).thenReturn(Optional.of(testAppliance));
        when(cache.get(100L)).thenReturn(existingState);
        when(eventLogRepository.save(any(EventLog.class))).thenAnswer(i -> i.getArgument(0));

        anomalyRuleService.checkAppliance(100L, new BigDecimal("2000.00")); // breach 3!

        verify(eventLogRepository).save(argThat(log -> "ANOMALY_DETECTED".equals(log.getEventType())));
        verify(aiNotificationService).notify(eq(10L), eq("ANOMALY_DETECTED"), any(), any());
        verify(cache).put(eq(100L), argThat(ApplianceBreachState::isAnomalyFlagged));
    }
}
