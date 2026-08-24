package com.i2i.wattie.telemetry.scheduler;

import com.i2i.wattie.home.entity.ConsumptionSnapshot;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.ConsumptionSnapshotRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.telemetry.model.HomeState;
import com.i2i.wattie.telemetry.service.IgniteStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SnapshotScheduler {

    private final HomeRepository homeRepository;
    private final IgniteStateService igniteStateService;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;

    // Demo/test için kısa tutuldu (60 saniye). Gerçek kullanımda günde bir kere
    // (örn. gece yarısı cron ile) çalışması daha mantıklı olurdu.
    @Scheduled(fixedRate = 60000)
    public void takeSnapshots() {
        List<Home> homes = homeRepository.findAll();

        for (Home home : homes) {
            HomeState state = igniteStateService.getHomeState(home.getId());
            if (state == null) {
                continue;
            }

            ConsumptionSnapshot snapshot = new ConsumptionSnapshot();
            snapshot.setHome(home);
            snapshot.setSnapshotDate(LocalDate.now());
            snapshot.setTotalKwh(state.getTotalKwh());
            snapshot.setTotalCost(state.getTotalCost());

            consumptionSnapshotRepository.save(snapshot);
        }
    }
}