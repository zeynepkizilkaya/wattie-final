package com.i2i.wattie.telemetry.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryMessage {
    private Long homeId;
    private Long applianceId;
    private BigDecimal watts;
}