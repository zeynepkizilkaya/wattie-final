const BASE_RATE = 2.07;

const PENALTY_TIERS = [
  { threshold: 160, multiplier: 2.5 },
  { threshold: 140, multiplier: 2.0 },
  { threshold: 120, multiplier: 1.5 },
  { threshold: 100, multiplier: 1.25 },
];

export function getPenaltyMultiplier(quotaPercent) {
  if (quotaPercent < 100) return 1.0;
  for (const tier of PENALTY_TIERS) {
    if (quotaPercent >= tier.threshold) return tier.multiplier;
  }
  return 1.0;
}

export function getEffectiveRate(quotaPercent) {
  return BASE_RATE * getPenaltyMultiplier(quotaPercent);
}

export function calculateTieredBilling(totalKwh, quotaPercent) {
  const multiplier = getPenaltyMultiplier(quotaPercent);
  const penaltyRate = BASE_RATE * multiplier;

  if (quotaPercent <= 100 || totalKwh <= 0) {
    const total = Math.round(totalKwh * BASE_RATE * 100) / 100;
    return {
      normalKwh: Math.round(totalKwh * 100) / 100,
      excessKwh: 0,
      normalCost: total,
      excessCost: 0,
      totalBill: total,
      multiplier: 1.0,
      penaltyRate: BASE_RATE,
    };
  }

  const baseQuotaKwh = totalKwh / (quotaPercent / 100);
  const normalKwh = Math.min(totalKwh, baseQuotaKwh);
  const excessKwh = Math.max(0, totalKwh - normalKwh);

  const normalCost = normalKwh * BASE_RATE;
  const excessCost = excessKwh * penaltyRate;
  const totalBill = Math.round((normalCost + excessCost) * 100) / 100;

  return {
    normalKwh: Math.round(normalKwh * 100) / 100,
    excessKwh: Math.round(excessKwh * 100) / 100,
    normalCost: Math.round(normalCost * 100) / 100,
    excessCost: Math.round(excessCost * 100) / 100,
    totalBill,
    multiplier,
    penaltyRate,
  };
}

export function getPenaltyTierLabel(quotaPercent) {
  if (quotaPercent < 100) return "Normal Tarife";
  if (quotaPercent < 120) return "Kademeli Ceza Kademe 1";
  if (quotaPercent < 140) return "Kademeli Ceza Kademe 2";
  if (quotaPercent < 160) return "Kademeli Ceza Kademe 3";
  return "Kademeli Ceza Kademe 4";
}

export { BASE_RATE };
