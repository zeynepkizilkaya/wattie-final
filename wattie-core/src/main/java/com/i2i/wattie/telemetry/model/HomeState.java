package com.i2i.wattie.telemetry.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HomeState implements Serializable {

    private Long homeId;
    private BigDecimal totalKwh;
    private BigDecimal totalCost;
    private boolean penaltyActive;
}