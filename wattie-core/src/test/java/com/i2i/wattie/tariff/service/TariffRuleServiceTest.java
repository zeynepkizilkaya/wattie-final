package com.i2i.wattie.tariff.service;

import com.i2i.wattie.ai.service.AiNotificationService;
import com.i2i.wattie.home.entity.EventLog;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.telemetry.model.HomeState;
import com.i2i.wattie.telemetry.service.IgniteStateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TariffRuleServiceTest {

    @Mock
    private IgniteStateService igniteStateService;

    @Mock
    private HomeRepository homeRepository;

    @Mock
    private EventLogRepository eventLogRepository;

    @Mock
    private AiNotificationService aiNotificationService;

    @InjectMocks
    private TariffRuleService tariffRuleService;

    private Home testHome;

    @BeforeEach
    void setUp() {
        testHome = new Home();
        testHome.setId(1L);
        testHome.setPowerQuotaKwh(new BigDecimal("100.00"));
        testHome.setFinancialQuota(new BigDecimal("500.00"));
        testHome.setContactEmail("test@example.com");
    }

    @Test
    void checkQuota_whenBelow80Percent_shouldNotTriggerEvents() {
        HomeState state = new HomeState(1L, new BigDecimal("50.00"), new BigDecimal("200.00"), false);

        when(igniteStateService.getHomeState(1L)).thenReturn(state);
        when(homeRepository.findById(1L)).thenReturn(Optional.of(testHome));
        when(eventLogRepository.findTopByHomeIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());

        tariffRuleService.checkQuota(1L);

        verify(eventLogRepository, never()).save(any());
        verify(aiNotificationService, never()).notify(any(), any(), any(), any());
    }

    @Test
    void checkQuota_whenReaches80Percent_shouldTriggerQuota80Event() {
        // 85 kWh out of 100 kWh -> 85%
        HomeState state = new HomeState(1L, new BigDecimal("85.00"), new BigDecimal("300.00"), false);

        when(igniteStateService.getHomeState(1L)).thenReturn(state);
        when(homeRepository.findById(1L)).thenReturn(Optional.of(testHome));
        when(eventLogRepository.findTopByHomeIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());
        when(eventLogRepository.save(any(EventLog.class))).thenAnswer(i -> i.getArgument(0));

        tariffRuleService.checkQuota(1L);

        ArgumentCaptor<EventLog> logCaptor = ArgumentCaptor.forClass(EventLog.class);
        verify(eventLogRepository).save(logCaptor.capture());
        assertEquals("QUOTA_80", logCaptor.getValue().getEventType());

        verify(aiNotificationService).notify(eq(1L), eq("QUOTA_80"), any(), any());
    }

    @Test
    void checkQuota_whenReaches100Percent_shouldActivatePenaltyAndTriggerQuota100() {
        // 105 kWh out of 100 kWh -> 105%
        HomeState state = new HomeState(1L, new BigDecimal("105.00"), new BigDecimal("400.00"), false);

        when(igniteStateService.getHomeState(1L)).thenReturn(state);
        when(homeRepository.findById(1L)).thenReturn(Optional.of(testHome));
        when(eventLogRepository.findTopByHomeIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());
        when(eventLogRepository.save(any(EventLog.class))).thenAnswer(i -> i.getArgument(0));

        tariffRuleService.checkQuota(1L);

        verify(igniteStateService).setPenaltyActive(1L, true);
        verify(eventLogRepository, times(2)).save(any(EventLog.class));
        verify(aiNotificationService).notify(eq(1L), eq("PENALTY_ACTIVATED"), any(), any());
    }
}
