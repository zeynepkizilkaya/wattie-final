package com.i2i.wattie.tariff;

import java.math.BigDecimal;

public final class TariffConstants {

    public static final BigDecimal QUOTA_WARNING_THRESHOLD = new BigDecimal("0.80");
    public static final BigDecimal QUOTA_PENALTY_THRESHOLD = new BigDecimal("1.00");
    public static final int ANOMALY_CONSECUTIVE_BREACHES = 3;

    private TariffConstants() {}
}
