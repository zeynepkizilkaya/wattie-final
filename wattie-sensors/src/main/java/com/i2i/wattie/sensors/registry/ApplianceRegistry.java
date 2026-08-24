package com.i2i.wattie.sensors.registry;

import com.i2i.wattie.sensors.dto.HomeRegisteredEvent;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ApplianceRegistry {

    // homeId -> o evin cihaz listesi. Postgres'e hiç dokunmuyoruz,
    // sadece Kafka'dan öğrendiklerimizi bellekte tutuyoruz.
    private final Map<Long, List<HomeRegisteredEvent.ApplianceInfo>> homes = new ConcurrentHashMap<>();

    public void register(HomeRegisteredEvent event) {
        homes.put(event.getHomeId(), event.getAppliances());
    }

    public Map<Long, List<HomeRegisteredEvent.ApplianceInfo>> getAllHomes() {
        return homes;
    }
}