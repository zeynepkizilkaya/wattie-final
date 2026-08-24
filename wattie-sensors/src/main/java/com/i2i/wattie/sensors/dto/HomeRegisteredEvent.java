package com.i2i.wattie.sensors.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HomeRegisteredEvent {

    private Long homeId;
    private String homeName;
    private List<ApplianceInfo> appliances;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplianceInfo {
        private Long applianceId;
        private String name;
        private String type;
        private BigDecimal safeLimitWatts;
    }
}