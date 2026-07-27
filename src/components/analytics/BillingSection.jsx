import { calculateTieredBilling, getPenaltyTierLabel, BASE_RATE } from "../../utils/billing";

export function BillingSection({ home }) {
  if (!home) return null;

  const usedKwh = home.usedKwh ?? home.totalConsumptionKwh ?? 240;
  const quotaPct = home.quotaKwh ? Math.min(100, Math.round((usedKwh / home.quotaKwh) * 100)) : (home.quotaUsagePercent ?? 80);
  const isPenalty = home.tariffState === "PENALTY" || quotaPct >= 100;
  const tiered = calculateTieredBilling(usedKwh, quotaPct);

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-1)" }}>
          🧾 Faturalandırma & Kademeli Tarife Hesabı
        </h3>
        <span className={`tariff-pill ${isPenalty ? "danger" : quotaPct >= 80 ? "warning" : "normal"}`}>
          {getPenaltyTierLabel(quotaPct)}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--surface)" }}>
          <span style={{ color: "var(--text-2)" }}>Tarife Türü</span>
          <strong style={{ color: isPenalty ? "var(--danger)" : "var(--current)" }}>
            {getPenaltyTierLabel(quotaPct)}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--surface)" }}>
          <span style={{ color: "var(--text-2)" }}>Baz Birim Fiyat (Kota İçi)</span>
          <span className="mono" style={{ color: "var(--text-1)", fontWeight: "600" }}>{BASE_RATE.toFixed(2)} ₺/kWh</span>
        </div>

        {isPenalty && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--danger-dim)", border: "1px solid var(--danger)" }}>
              <span style={{ color: "var(--danger)" }}>Aşım Ceza Çarpanı</span>
              <strong className="mono" style={{ color: "var(--danger)" }}>
                ×{tiered.multiplier.toFixed(2)} (Aşan kısma özel)
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--danger-dim)" }}>
              <span style={{ color: "var(--danger)" }}>Aşım Birim Fiyatı</span>
              <strong className="mono" style={{ color: "var(--danger)" }}>
                {tiered.penaltyRate.toFixed(2)} ₺/kWh
              </strong>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--surface)" }}>
          <span style={{ color: "var(--text-2)" }}>Toplam Tüketim</span>
          <strong className="mono" style={{ color: "var(--volt)" }}>{usedKwh.toFixed(2)} kWh</strong>
        </div>

        <div style={{ height: "1px", background: "var(--panel-border)", margin: "4px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-1)" }}>Hesaplanan Toplam Fatura</span>
          <span className="mono" style={{ fontSize: "20px", fontWeight: "800", color: isPenalty ? "var(--danger)" : "var(--volt)" }}>
            ₺{tiered.totalBill.toLocaleString("tr-TR")}
          </span>
        </div>
      </div>
    </div>
  );
}
