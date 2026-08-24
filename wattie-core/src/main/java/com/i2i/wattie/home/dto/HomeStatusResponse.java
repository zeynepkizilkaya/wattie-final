package com.i2i.wattie.home.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatusResponse {
    private Long homeId;
    private BigDecimal totalKwh;
    private BigDecimal totalCost;
    private boolean penaltyActive;
}