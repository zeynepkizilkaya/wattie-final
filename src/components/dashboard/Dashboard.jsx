import { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api, ApiError } from "../../lib/api";
import { mockEnergyFlow } from "../../lib/mockData";
import { useAppStore } from "../../store/useAppStore";
import HomeSelector from "./HomeSelector";
import AddHomeModal from "./AddHomeModal";
import House3D from "../home-detail/House3D";
import "./dashboard.css";

export default function Dashboard() {
  const [homes, setHomes] = useState([]);
  const [, startTransition] = useTransition();

  const selectedHomeId = useAppStore((s) => s.selectedHomeId);

  // Modals state
  const [isAddHomeModalOpen, setIsAddHomeModalOpen] = useState(false);

  // Live clock state
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(
        now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadHomes = async () => {
    try {
      const data = await api.getHomes();
      startTransition(() => {
        setHomes(data);
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Veriler alınırken beklenmeyen bir hata oluştu.";
      pushToast(msg, "danger");
    }
  };

  useEffect(() => {
    loadHomes();
    const timer = setInterval(() => {
      loadHomes();
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeHome = selectedHomeId ? homes.find((h) => h.id === selectedHomeId) : null;

  const displayKwh = activeHome
    ? activeHome.usedKwh
    : homes.reduce((sum, h) => sum + (h.usedKwh || 0), 0);

  const displayQuotaKwh = activeHome
    ? activeHome.quotaKwh
    : homes.reduce((sum, h) => sum + (h.quotaKwh || 0), 0);

  const displayTry = activeHome
    ? activeHome.usedTry
    : homes.reduce((sum, h) => sum + (h.usedTry || 0), 0);

  const displayQuotaTry = activeHome
    ? activeHome.quotaTry
    : homes.reduce((sum, h) => sum + (h.quotaTry || 0), 0);

  const displayKw = (displayKwh / 100).toFixed(2);
  const energyFlowData = mockEnergyFlow(selectedHomeId);

  const handleSelectHome = (home) => {
    if (home?.id) {
      navigate(`/home/${home.id}`);
    }
  };

  const handleHomeAdded = (newHome) => {
    setHomes((prev) => [...prev, newHome]);
  };

  const topDevices = activeHome?.appliances
    ? activeHome.appliances
        .slice()
        .sort((a, b) => b.currentWatt - a.currentWatt)
        .slice(0, 4)
        .map((a) => ({
          name: `${a.name} (${a.room})`,
          kw: (a.currentWatt / 1000).toFixed(2),
          pct: Math.min(100, Math.round((a.currentWatt / (a.safeWatt || 1)) * 100)),
          color: a.isAnomalous ? "var(--danger)" : "var(--volt)",
        }))
    : [
        { name: "Klima (Yatak Odası)", kw: "1.65", pct: 42, color: "var(--volt)" },
        { name: "Fırın (Mutfak)", kw: "1.12", pct: 28, color: "var(--arc)" },
        { name: "Çamaşır Makinesi (Banyo)", kw: "0.78", pct: 18, color: "var(--current)" },
        { name: "Televizyon (Oturma O.)", kw: "0.21", pct: 12, color: "var(--text-2)" },
      ];

  return (
    <div className="dashboard-page-container">
      {/* 1. Home Selection Chips Bar */}
      <HomeSelector homes={homes} onAddHomeClick={() => setIsAddHomeModalOpen(true)} />

      {/* 2. Top KPI Cards */}
      <div className="dashboard-top-widgets">
        {/* Clock Card */}
        <div className="widget-card glass-panel clock-widget">
          <span className="clock-time mono">{timeStr || "20:09"}</span>
          <span className="clock-date">{dateStr || "25 Temmuz 2026 Cumartesi"}</span>
        </div>

        {/* Live Power Card */}
        <div className="widget-card glass-panel stat-widget">
          <div className="widget-icon-box current">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div className="widget-content">
            <span className="widget-label">
              {activeHome ? `${activeHome.name} Anlık Tüketim` : "Anlık Toplam Tüketim"}
            </span>
            <strong className="widget-value mono">{displayKw} kW</strong>
            <span className="widget-trend success">↓ %12 düne göre</span>
          </div>
        </div>

        {/* Usage Card */}
        <div className="widget-card glass-panel stat-widget">
          <div className="widget-icon-box arc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div className="widget-content">
            <span className="widget-label">Kullanım / Kota</span>
            <strong className="widget-value mono">{displayKwh} kWh</strong>
            <span className="widget-sub">Kota: {displayQuotaKwh} kWh</span>
          </div>
        </div>

        {/* Cost Card */}
        <div className="widget-card glass-panel stat-widget">
          <div className="widget-icon-box volt">TRY</div>
          <div className="widget-content">
            <span className="widget-label">Fatura / Bütçe</span>
            <strong className="widget-value mono">₺{displayTry.toLocaleString("tr-TR")}</strong>
            <span className="widget-sub">Bütçe: ₺{displayQuotaTry.toLocaleString("tr-TR")}</span>
          </div>
        </div>
      </div>

      {/* 3. Central 3D Street View Hero (Multiple Houses) */}
      <div className="glass-panel house-preview-3d-panel">
        <div className="preview-3d-overlay">
          <span className="overlay-badge mono">
            {activeHome ? `${activeHome.name.toUpperCase()}: ${displayKw} kW` : `SOKAK TÜKETİMİ: ${displayKw} kW`}
          </span>
        </div>
        <div className="preview-3d-canvas-wrapper">
          <House3D
            homes={homes}
            activeHomeId={selectedHomeId}
            onSelectHome={(h) => handleSelectHome(h)}
          />
        </div>
      </div>

      {/* 4. Streamlined 2-Column Section */}
      <div className="dashboard-main-grid">
        {/* LEFT: 24-Hour Energy Flow LineChart */}
        <div className="glass-panel energy-flow-panel">
          <div className="panel-header">
            <h3>24 Saatlik Enerji Akış Grafiği</h3>
            <span className="mono subtitle">Tüketim vs Güneş vs Şebeke</span>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={energyFlowData}>
                <XAxis dataKey="hour" stroke="var(--text-3)" fontSize={10} />
                <YAxis stroke="var(--text-3)" fontSize={10} unit="kW" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 15, 25, 0.94)",
                    borderColor: "var(--panel-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="consumption" name="Tüketim" stroke="var(--danger)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="solar" name="Güneş" stroke="var(--volt)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="battery" name="Batarya" stroke="var(--current)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="grid" name="Şebeke" stroke="var(--arc)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Top Consuming Devices */}
        <div className="glass-panel top-devices-widget">
          <div className="panel-header">
            <h3>En Çok Tüketen Cihazlar</h3>
            <button
              type="button"
              className="btn-link"
              onClick={() => navigate("/devices")}
            >
              Tüm Cihazlar →
            </button>
          </div>

          <div className="device-ranking-list">
            {topDevices.map((d, i) => (
              <div key={i} className="ranking-item">
                <div className="item-info">
                  <span className="name">{d.name}</span>
                  <span className="kw mono">{d.kw} kW (%{d.pct})</span>
                </div>
                <div className="ranking-bar-track">
                  <div className="ranking-bar-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddHomeModal
        open={isAddHomeModalOpen}
        onClose={() => setIsAddHomeModalOpen(false)}
        onHomeAdded={handleHomeAdded}
      />
    </div>
  );
}
