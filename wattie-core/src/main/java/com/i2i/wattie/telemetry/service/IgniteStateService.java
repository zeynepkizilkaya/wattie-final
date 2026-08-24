package com.i2i.wattie.telemetry.service;

import com.i2i.wattie.telemetry.model.HomeState;
import org.apache.ignite.client.ClientCache;
import org.apache.ignite.client.IgniteClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class IgniteStateService {

    private static final String CACHE_NAME = "homeStates";

    private final IgniteClient igniteClient;

    public IgniteStateService(IgniteClient igniteClient) {
        this.igniteClient = igniteClient;
    }

    private ClientCache<Long, HomeState> cache() {
        return igniteClient.getOrCreateCache(CACHE_NAME);
    }

    public void initializeHomeState(Long homeId) {
        HomeState state = new HomeState(homeId, BigDecimal.ZERO, BigDecimal.ZERO, false);
        cache().put(homeId, state);
    }

    public HomeState getHomeState(Long homeId) {
        return cache().get(homeId);
    }

    public void recordConsumption(Long homeId, BigDecimal deltaKwh, BigDecimal deltaCost) {
        ClientCache<Long, HomeState> cache = cache();
        HomeState state = cache.get(homeId);

        if (state == null) {
            // Home henüz initialize edilmemişse (beklenmedik durum), sıfırdan oluştur.
            state = new HomeState(homeId, BigDecimal.ZERO, BigDecimal.ZERO, false);
        }

        state.setTotalKwh(state.getTotalKwh().add(deltaKwh));
        state.setTotalCost(state.getTotalCost().add(deltaCost));

        cache.put(homeId, state);
    }

    public void setPenaltyActive(Long homeId, boolean active) {
        ClientCache<Long, HomeState> cache = cache();
        HomeState state = cache.get(homeId);
        if (state != null) {
            state.setPenaltyActive(active);
            cache.put(homeId, state);
        }
    }
}