package com.i2i.wattie.home.service;

import com.i2i.wattie.ai.service.AiNotificationService;
import com.i2i.wattie.home.dto.ApplianceRequest;
import com.i2i.wattie.home.dto.ConsumptionTrendResponse;
import com.i2i.wattie.home.dto.HomeRegistrationRequest;
import com.i2i.wattie.home.dto.HomeResponse;
import com.i2i.wattie.home.entity.Appliance;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.ApplianceRepository;
import com.i2i.wattie.home.repository.ConsumptionSnapshotRepository;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.telemetry.dto.HomeRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.i2i.wattie.telemetry.service.IgniteStateService;
import com.i2i.wattie.home.dto.HomeStatusResponse;
import com.i2i.wattie.telemetry.model.HomeState;

import java.util.List;
import java.util.stream.Collectors;

import static com.i2i.wattie.common.config.KafkaTopicConfig.REGISTRATION_TOPIC;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final HomeRepository homeRepository;
    private final ApplianceRepository applianceRepository;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;
    private final EventLogRepository eventLogRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final IgniteStateService igniteStateService;

    @Transactional
    public HomeResponse registerHome(HomeRegistrationRequest request) {
        Home home = new Home();
        home.setName(request.getName());
        home.setAddress(request.getAddress());
        home.setContactEmail(request.getContactEmail());
        home.setPowerQuotaKwh(request.getPowerQuotaKwh());
        home.setFinancialQuota(request.getFinancialQuota());
        home.setNormalTariffRate(request.getNormalTariffRate());
        home.setPenaltyTariffRate(request.getPenaltyTariffRate());

        Home savedHome = homeRepository.save(home);

        List<Appliance> savedAppliances = request.getAppliances().stream()
                .map(applianceRequest -> {
                    Appliance appliance = new Appliance();
                    appliance.setHome(savedHome);
                    appliance.setName(applianceRequest.getName());
                    appliance.setType(applianceRequest.getType());
                    appliance.setSafeLimitWatts(applianceRequest.getSafeLimitWatts());
                    return applianceRepository.save(appliance);
                })
                .toList();

        publishRegistrationEvent(savedHome, savedAppliances);
        igniteStateService.initializeHomeState(savedHome.getId());

        HomeResponse response = new HomeResponse();
        response.setId(savedHome.getId());
        response.setName(savedHome.getName());
        response.setMessage("Home registered successfully");
        return response;
    }
    public HomeStatusResponse getHomeStatus(Long homeId) {
        HomeState state = igniteStateService.getHomeState(homeId);
        if (state == null) {
            throw new IllegalArgumentException("No live state found for home id: " + homeId);
        }
        return new HomeStatusResponse(state.getHomeId(), state.getTotalKwh(), state.getTotalCost(), state.isPenaltyActive());
    }

    private void publishRegistrationEvent(Home home, List<Appliance> appliances) {
        List<HomeRegisteredEvent.ApplianceInfo> applianceInfos = appliances.stream()
                .map(a -> new HomeRegisteredEvent.ApplianceInfo(
                        a.getId(), a.getName(), a.getType(), a.getSafeLimitWatts()))
                .collect(Collectors.toList());

        HomeRegisteredEvent event = new HomeRegisteredEvent(home.getId(), home.getName(), applianceInfos);
        kafkaTemplate.send(REGISTRATION_TOPIC, home.getId().toString(), event);
    }

    public List<Home> getAllHomes() {
        return homeRepository.findAll();
    }

    public List<Appliance> getHomeAppliances(Long homeId) {
        return applianceRepository.findByHomeId(homeId);
    }

    @Transactional
    public Appliance addApplianceToHome(Long homeId, ApplianceRequest request) {
        Home home = homeRepository.findById(homeId)
                .orElseThrow(() -> new IllegalArgumentException("Home not found with id: " + homeId));

        Appliance appliance = new Appliance();
        appliance.setHome(home);
        appliance.setName(request.getName());
        appliance.setType(request.getType());
        appliance.setSafeLimitWatts(request.getSafeLimitWatts());

        Appliance savedAppliance = applianceRepository.save(appliance);
        publishRegistrationEvent(home, List.of(savedAppliance));
        return savedAppliance;
    }

    public List<com.i2i.wattie.home.entity.EventLog> getHomeEvents(Long homeId) {
        return eventLogRepository.findByHomeIdOrderByCreatedAtDesc(homeId);
    }

    public List<ConsumptionTrendResponse> getConsumptionTrend(Long homeId) {
        return consumptionSnapshotRepository.findByHomeIdOrderBySnapshotDateAsc(homeId)
                .stream()
                .map(snapshot -> {
                    ConsumptionTrendResponse response = new ConsumptionTrendResponse();
                    response.setDate(snapshot.getSnapshotDate());
                    response.setTotalKwh(snapshot.getTotalKwh());
                    response.setTotalCost(snapshot.getTotalCost());
                    return response;
                })
                .toList();
    }
}