package com.i2i.wattie.home.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ConsumptionTrendResponse {
    private LocalDate date;
    private BigDecimal totalKwh;
    private BigDecimal totalCost;
}