package com.i2i.wattie.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ApplianceRequest {

    @NotBlank
    private String name;

    private String type;

    @NotNull
    @Positive
    private BigDecimal safeLimitWatts;
}