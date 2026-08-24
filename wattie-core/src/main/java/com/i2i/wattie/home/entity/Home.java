package com.i2i.wattie.home.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "homes")
@Getter
@Setter
public class Home {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "power_quota_kwh", nullable = false)
    private BigDecimal powerQuotaKwh;

    @Column(name = "financial_quota", nullable = false)
    private BigDecimal financialQuota;

    @Column(name = "normal_tariff_rate", nullable = false)
    private BigDecimal normalTariffRate;

    @Column(name = "penalty_tariff_rate", nullable = false)
    private BigDecimal penaltyTariffRate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}