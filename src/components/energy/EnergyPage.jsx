import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { mockEnergySources, mockEnergyFlow } from "../../lib/mockData";
import "./energy.css";

export default function EnergyPage() {
  const [activeSourceFilter, setActiveSourceFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");

  const sources = mockEnergySources();
  const flowData = mockEnergyFlow();

  const filteredFlowData = flowData.map((item) => {
    if (activeSourceFilter === "solar") return { hour: item.hour, solar: item.solar };
    if (activeSourceFilter === "battery") return { hour: item.hour, battery: item.battery };
    if (activeSourceFilter === "grid") return { hour: item.hour, grid: item.grid };
    return item;
  });

  return (
    <motion.div
      className="energy-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="energy-header">
        <div>
          <h2>Enerji Üretimi & Depolama Analizi</h2>
          <p className="subtitle">Yenilenebilir Güneş Panellerinizin (Solar), Tesla Powerwall Bataryanızın ve Şehir Şebekesi (Grid) alım/satım verilerinin canlı yönetimi ve optimizasyonu.</p>
        </div>

        {/* Time Range Selector */}
        <div className="energy-range-picker glass-panel">
          {["24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              type="button"
              className={`range-btn ${timeRange === r ? "active" : ""}`}
              onClick={() => setTimeRange(r)}
            >
              {r === "24h" ? "Son 24 Saat" : r === "7d" ? "Son 7 Gün" : "Son 30 Gün"}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Source Filter & Search Bar */}
      <div className="energy-filter-bar glass-panel">
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${activeSourceFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveSourceFilter("all")}
          >
            Tüm Kaynaklar (3)
          </button>
          <button
            type="button"
            className={`filter-chip solar ${activeSourceFilter === "solar" ? "active" : ""}`}
            onClick={() => setActiveSourceFilter("solar")}
          >
            Güneş Panelleri ({sources.solar.kw} kW)
          </button>
          <button
            type="button"
            className={`filter-chip battery ${activeSourceFilter === "battery" ? "active" : ""}`}
            onClick={() => setActiveSourceFilter("battery")}
          >
            Batarya Depolama (%{sources.battery.pct})
          </button>
          <button
            type="button"
            className={`filter-chip grid ${activeSourceFilter === "grid" ? "active" : ""}`}
            onClick={() => setActiveSourceFilter("grid")}
          >
            Şebeke (%{sources.grid.pct})
          </button>
        </div>

        <div className="energy-search-box">
          <input
            type="text"
            placeholder="Enerji parametresi veya sayaç ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Source Metric Cards */}
      <div className="energy-sources-grid">
        {/* Solar Card */}
        <div
          className={`glass-panel source-card solar ${activeSourceFilter === "solar" ? "selected" : ""}`}
          onClick={() => setActiveSourceFilter("solar")}
        >
          <div className="source-card-header">
            <div>
              <h3>Güneş Panelleri (Solar PV)</h3>
              <span className="sub">Pik Güç Tüketim Offsetting</span>
            </div>
            <span className="badge-status success">ÜRETİMDE</span>
          </div>
          <div className="source-metric-row">
            <strong className="value mono">{sources.solar.kw} kW</strong>
            <span className="pct mono text-volt">% {sources.solar.pct} Offsetting</span>
          </div>
          <div className="source-detail-list">
            <span>Günlük Toplam Üretim: <strong className="mono">{sources.solar.dailyKwh} kWh</strong></span>
            <span>Panel Verimlilik Skoru: <strong className="mono">%94</strong></span>
          </div>
        </div>

        {/* Battery Card */}
        <div
          className={`glass-panel source-card battery ${activeSourceFilter === "battery" ? "selected" : ""}`}
          onClick={() => setActiveSourceFilter("battery")}
        >
          <div className="source-card-header">
            <div>
              <h3>Batarya Depolama (Tesla Powerwall)</h3>
              <span className="sub">Gece & Şebeke Kesinti Yedeklemesi</span>
            </div>
            <span className="badge-status current">ŞARJ OLUYOR</span>
          </div>
          <div className="source-metric-row">
            <strong className="value mono">{sources.battery.kw} kW</strong>
            <span className="pct mono text-current">% {sources.battery.pct} Doluluk</span>
          </div>
          <div className="source-detail-list">
            <span>Toplam Kapasite: <strong className="mono">{sources.battery.capacityKwh} kWh</strong></span>
            <span>Otomasyon: <strong className="mono">Gece 23:00 Besleme</strong></span>
          </div>
        </div>

        {/* Grid Card */}
        <div
          className={`glass-panel source-card grid ${activeSourceFilter === "grid" ? "selected" : ""}`}
          onClick={() => setActiveSourceFilter("grid")}
        >
          <div className="source-card-header">
            <div>
              <h3>Şebeke (Grid Import / Export)</h3>
              <span className="sub">Şehir Şebekesinden Çekilen Güç</span>
            </div>
            <span className="badge-status arc">ŞEBEKE BAĞLI</span>
          </div>
          <div className="source-metric-row">
            <strong className="value mono">{sources.grid.kw} kW</strong>
            <span className="pct mono text-arc">% {sources.grid.pct} İthalat</span>
          </div>
          <div className="source-detail-list">
            <span>Anlık Tarife: <strong className="mono">Gündüz Standart (₺2.4/kWh)</strong></span>
            <span>Son 24s Şebeke Çekimi: <strong className="mono">6.4 kWh</strong></span>
          </div>
        </div>
      </div>

      {/* Production vs Consumption AreaChart */}
      <div className="glass-panel energy-chart-panel">
        <div className="panel-header">
          <h3>24 Saatlik Üretim & Tüketim Akış Grafiği</h3>
          <span className="subtitle mono">
            {activeSourceFilter === "solar"
              ? "Güneş Üretim Eğrisi"
              : activeSourceFilter === "battery"
              ? "Batarya Şarj/Deşarj Eğrisi"
              : activeSourceFilter === "grid"
              ? "Şebeke Çekim Eğrisi"
              : "Güneş vs Batarya vs Tüketim"}
          </span>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={filteredFlowData}>
              <XAxis dataKey="hour" stroke="var(--text-3)" fontSize={11} />
              <YAxis stroke="var(--text-3)" fontSize={11} unit="kW" />
              <Tooltip
                contentStyle={{
                  background: "var(--panel-solid)",
                  borderColor: "var(--panel-border)",
                  color: "var(--text-1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              {(activeSourceFilter === "all" || activeSourceFilter === "solar") && (
                <Area type="monotone" dataKey="solar" name="Güneş Üretimi" stroke="var(--volt)" fill="var(--volt-dim)" strokeWidth={2.5} />
              )}
              {(activeSourceFilter === "all" || activeSourceFilter === "battery") && (
                <Area type="monotone" dataKey="battery" name="Batarya Depolama" stroke="var(--current)" fill="var(--current-dim)" strokeWidth={2} />
              )}
              {(activeSourceFilter === "all" || activeSourceFilter === "grid") && (
                <Area type="monotone" dataKey="grid" name="Şebeke Çekimi" stroke="var(--arc)" fill="var(--arc-dim)" strokeWidth={2} />
              )}
              {activeSourceFilter === "all" && (
                <Area type="monotone" dataKey="consumption" name="Ev Tüketimi" stroke="var(--danger)" fill="var(--danger-dim)" strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
