import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Power, Clock, X } from "lucide-react";
import { MOCK_TELEMETRY } from "./mockTelemetry";

export function DeviceInfoPanel({ deviceId, onClose, deviceState, onPowerToggle }) {
  if (!deviceId) return null;
  const telemetry = deviceState || MOCK_TELEMETRY[deviceId];
  if (!telemetry) return null;

  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [timerPreset, setTimerPreset] = useState("Off");

  const powerOn = telemetry.status === "online";

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "360px",
        maxWidth: "100%",
        height: "100vh",
        background: "rgba(6, 16, 27, 0.95)",
        backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: "20px",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#38bdf8", textTransform: "uppercase" }}>
            {telemetry.room} · Kat Cihaz Telemetrisi
          </span>
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "4px 0 0" }}>{telemetry.name}</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Status Badge & Power Meter */}
        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Anlık Güç Çekimi</span>
            <span style={{ fontSize: "12px", color: powerOn ? "#10b981" : "#ef4444", fontWeight: "600" }}>
              {powerOn ? "🟢 AKTİF" : "🔴 KAPALI"}
            </span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#38bdf8", fontFamily: "monospace" }}>
            {powerOn ? telemetry.currentPower : 0} W
          </div>
        </div>

        {/* Device Controls */}
        {onPowerToggle && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                userSelect: "none",
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.7)",
                textTransform: "uppercase",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sliders size={15} color="#fbbf24" />
                <span>Cihaz Kontrolleri</span>
              </div>
            </div>

            {isControlsOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                {/* Power Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Power size={15} color={powerOn ? "#10b981" : "#6b7280"} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e7eb" }}>Güç Durumu</span>
                  </div>
                  <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", padding: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <button
                      onClick={() => onPowerToggle(deviceId, "online")}
                      style={{
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: powerOn ? "#10b981" : "transparent",
                        color: powerOn ? "#fff" : "rgba(255, 255, 255, 0.45)",
                      }}
                    >
                      AÇIK
                    </button>
                    <button
                      onClick={() => onPowerToggle(deviceId, "offline")}
                      style={{
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: !powerOn ? "#ef4444" : "transparent",
                        color: !powerOn ? "#fff" : "rgba(255, 255, 255, 0.45)",
                      }}
                    >
                      KAPALI
                    </button>
                  </div>
                </div>

                {/* Timer Presets */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={15} color="#38bdf8" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e7eb" }}>Zamanlayıcı Preset</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {["Kapalı", "15dk", "30dk", "1st", "2st"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTimerPreset(preset)}
                        style={{
                          flex: 1,
                          background: timerPreset === preset ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.02)",
                          border: timerPreset === preset ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "6px",
                          padding: "6px 0",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: timerPreset === preset ? "#38bdf8" : "rgba(255, 255, 255, 0.6)",
                          cursor: "pointer",
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Bugünkü Tüketim</span>
            <strong style={{ display: "block", fontSize: "15px", marginTop: "4px" }}>{telemetry.todayConsumption} kWh</strong>
          </div>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Aylık Tahmin</span>
            <strong style={{ display: "block", fontSize: "15px", marginTop: "4px" }}>₺{telemetry.estimatedCost}</strong>
          </div>
        </div>

        {/* AI Advisory */}
        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(37, 99, 235, 0.15)", border: "1px solid rgba(37, 99, 235, 0.3)" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa" }}>✨ AI Verimlilik Önerisi</span>
          <p style={{ fontSize: "12.5px", marginTop: "6px", lineHeight: "1.4", color: "#e2e8f0" }}>
            {telemetry.aiRecommendation}
          </p>
        </div>

        {/* Health */}
        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Sağlık Skoru & Bakım</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>%{telemetry.healthScore}</div>
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{telemetry.maintenancePrediction}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            fontWeight: "600",
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Kapat
        </button>
      </div>
    </motion.div>
  );
}
