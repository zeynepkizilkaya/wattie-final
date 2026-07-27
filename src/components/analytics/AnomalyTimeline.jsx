import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const anomalyStartMap = {};

export function AnomalyTimeline({ appliances = [] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const entries = (appliances || [])
    .filter(a => (a.breachStreak && a.breachStreak > 0) || a.isAnomalous || (a.safeWatt > 0 && a.currentWatt > a.safeWatt))
    .map(a => {
      if (!anomalyStartMap[a.id]) {
        const initialOffsetMins = Math.max(1, (6 - Math.min(a.breachStreak || 1, 5)) * 3);
        anomalyStartMap[a.id] = Date.now() - initialOffsetMins * 60000;
      }

      const startTimeMs = anomalyStartMap[a.id] || Date.now();
      const elapsedMins = Math.max(1, Math.floor((now - startTimeMs) / 60000));
      const timeStr = elapsedMins < 60 ? `~${elapsedMins} dk önce başladı` : `~${Math.floor(elapsedMins / 60)} saat önce başladı`;
      const status = (a.isAnomalous || a.breachStreak >= 3 || (a.safeWatt > 0 && a.currentWatt > a.safeWatt)) ? "active" : "resolved";

      return {
        applianceId: a.id,
        applianceName: a.name,
        room: a.room || "Genel",
        status,
        breaches: a.breachStreak || 1,
        startTimeMs,
        timestamp: timeStr,
      };
    })
    .sort((a, b) => b.startTimeMs - a.startTimeMs);

  if (entries.length === 0) return null;

  return (
    <div className="glass-panel anomaly-timeline-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-1)" }}>Anomali Geçmişi ve Yük Zaman Çizelgesi</h4>
        <span className="mono" style={{ fontSize: "11px", color: "var(--danger)" }}>{entries.length} Cihaz İhlal Algılandı</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {entries.map((entry) => (
          <motion.div
            key={entry.applianceId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: entry.status === "active" ? "rgba(255, 71, 87, 0.1)" : "rgba(124, 158, 255, 0.08)",
              border: `1px solid ${entry.status === "active" ? "var(--danger)" : "var(--panel-border)"}`
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: entry.status === "active" ? "var(--danger)" : "var(--arc)",
                boxShadow: entry.status === "active" ? "0 0 8px var(--danger)" : "none"
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-1)" }}>
                {entry.applianceName} <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: "normal" }}>({entry.room})</span>
              </span>
              <span className="mono" style={{ fontSize: "11px", color: "var(--text-2)" }}>
                {entry.breaches} ardışık ihlal • {entry.timestamp}
              </span>
            </div>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "12px",
                background: entry.status === "active" ? "var(--danger-dim)" : "var(--arc-dim)",
                color: entry.status === "active" ? "var(--danger)" : "var(--arc)"
              }}
            >
              {entry.status === "active" ? "AKTİF ANOMALİ" : "İLENİYOR"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
