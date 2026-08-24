package com.i2i.wattie.home.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class HomeRegistrationRequest {

    @NotBlank
    private String name;

    private String address;

    @NotBlank
    @Email
    private String contactEmail;

    @NotNull
    @Positive
    private BigDecimal powerQuotaKwh;

    @NotNull
    @Positive
    private BigDecimal financialQuota;

    @NotNull
    @Positive
    private BigDecimal normalTariffRate;

    @NotNull
    @Positive
    private BigDecimal penaltyTariffRate;

    @NotEmpty
    private List<@Valid ApplianceRequest> appliances;
}