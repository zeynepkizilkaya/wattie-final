import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BASE_RATE, getPenaltyMultiplier } from "../../utils/billing";

export function CostBreakdownChart({ home }) {
  if (!home) return null;

  const usedKwh = home.usedKwh ?? home.totalConsumptionKwh ?? 240;
  const quotaPct = home.quotaKwh ? Math.min(100, Math.round((usedKwh / home.quotaKwh) * 100)) : (home.quotaUsagePercent ?? 80);
  const isPenalty = home.tariffState === "PENALTY" || quotaPct >= 100;

  const normalCost = Math.round(usedKwh * BASE_RATE * 100) / 100;
  const actualCost = home.usedTry ?? home.billingAmountTry ?? (normalCost * (isPenalty ? 1.25 : 1.0));
  const penaltyCost = Math.max(0, actualCost - normalCost);

  const data = [
    { name: "Normal Tarife", value: normalCost, color: "var(--arc)" },
    { name: "Ceza Ek Ücreti", value: penaltyCost > 0 ? penaltyCost : Math.round(normalCost * 0.15), color: "var(--danger)" },
  ];

  const multiplier = getPenaltyMultiplier(quotaPct);

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-1)" }}>Maliyet & Ceza Kırılımı</h4>
        <span className="mono" style={{ fontSize: "11px", color: "var(--text-2)" }}>Çarpan: ×{multiplier.toFixed(2)}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "160px", height: "160px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(10, 15, 25, 0.94)",
                  borderColor: "var(--panel-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#ffffff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((item) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
              <span style={{ color: "var(--text-2)", flex: 1 }}>{item.name}</span>
              <strong className="mono" style={{ color: "var(--text-1)" }}>₺{item.value.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
