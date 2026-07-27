import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { mockAnalytics } from "../../lib/mockData";
import { api } from "../../lib/api";
import { AnomalyTimeline } from "./AnomalyTimeline";
import { BillingSection } from "./BillingSection";
import { CostBreakdownChart } from "./CostBreakdownChart";
import "./analytics.css";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [homes, setHomes] = useState([]);
  const [devices, setDevices] = useState([]);

  const analyticsData = mockAnalytics(range);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedHomes = await api.getHomes();
        setHomes(fetchedHomes);
        const fetchedDevices = await api.getAllDevices();
        setDevices(fetchedDevices);
      } catch (err) {
        console.warn("Analytics data fetch error:", err);
      }
    }
    loadData();
  }, []);

  const sampleHome = homes[0] || {
    name: "Sahil Villası",
    usedKwh: 471.8,
    quotaKwh: 450,
    usedTry: 2830,
    tariffState: "PENALTY",
  };

  return (
    <motion.div
      className="analytics-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header & Date Range Controls */}
      <div className="analytics-header">
        <div>
          <h2>Karşılaştırmalı Enerji Analitiği & Kademeli Tarife</h2>
          <p className="subtitle">Konutlarınızın dönem bazlı toplam tüketimlerini, fatura maliyetlerini, anomali geçmişini ve kademeli ceza kırılımlarını inceleyin.</p>
        </div>

        <div className="range-picker-bar glass-panel">
          <button
            type="button"
            className={`range-btn ${range === "7d" ? "active" : ""}`}
            onClick={() => setRange("7d")}
          >
            Son 7 Gün
          </button>
          <button
            type="button"
            className={`range-btn ${range === "30d" ? "active" : ""}`}
            onClick={() => setRange("30d")}
          >
            Son 30 Gün
          </button>
          <button
            type="button"
            className={`range-btn ${range === "90d" ? "active" : ""}`}
            onClick={() => setRange("90d")}
          >
            Son 90 Gün
          </button>
        </div>
      </div>

      {/* Real-time Anomaly Timeline & Billing Section Row */}
      <div className="analytics-grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <BillingSection home={sampleHome} />
        <CostBreakdownChart home={sampleHome} />
      </div>

      {/* Anomaly Timeline */}
      <AnomalyTimeline appliances={devices} />

      {/* Main Analytics Grid */}
      <div className="analytics-grid">
        {/* Comparative Homes BarChart */}
        <div className="glass-panel analytics-card">
          <div className="card-header">
            <h3>Konutlar Arası Tüketim Karşılaştırması</h3>
            <span className="mono subtitle">kWh Cinsinden Toplam Tüketim</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.homeComparison}>
                <XAxis dataKey="name" stroke="var(--text-3)" fontSize={11} />
                <YAxis stroke="var(--text-3)" fontSize={11} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 15, 25, 0.94)",
                    borderColor: "var(--panel-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="kwh" name="Tüketim (kWh)" fill="var(--arc)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="glass-panel analytics-card">
          <div className="card-header">
            <h3>Cihaz Kategorisi Bazında Dağılım</h3>
            <span className="mono subtitle">% Tüketim Oranları</span>
          </div>
          <div className="chart-wrapper donut-flex">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryBreakdown}
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  nameKey="category"
                  paddingAngle={4}
                >
                  {analyticsData.categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 15, 25, 0.94)",
                    borderColor: "var(--panel-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass-panel summary-table-card">
        <div className="card-header">
          <h3>Konut Maliyet & Tarife Özet Tablosu</h3>
        </div>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>KONUT ADI</th>
              <th>TOPLAM TÜKETİM</th>
              <th>TAHMİNİ FATURA</th>
              <th>TARİFE DURUMU</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.homeComparison.map((home, index) => (
              <tr key={index}>
                <td><strong>{home.name}</strong></td>
                <td className="mono">{home.kwh} kWh</td>
                <td className="mono">₺{home.cost.toLocaleString("tr-TR")}</td>
                <td>
                  <span className={`tariff-pill ${home.status === "PENALTY" ? "danger" : home.status === "WARNING" ? "warning" : "normal"}`}>
                    {home.status === "PENALTY" ? "Ceza Tarifesi" : home.status === "WARNING" ? "%80 Kota Uyarısı" : "Normal Tarife"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
