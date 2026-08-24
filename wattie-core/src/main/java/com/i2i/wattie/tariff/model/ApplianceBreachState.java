package com.i2i.wattie.tariff.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplianceBreachState implements Serializable {

    private Long applianceId;
    private int consecutiveBreaches;
    private boolean anomalyFlagged;
}
