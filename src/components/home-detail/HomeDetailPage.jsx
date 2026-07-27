import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, ApiError } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";
import House3D from "./House3D";
import ApplianceList from "./ApplianceList";
import ApplianceInfoDrawer from "./ApplianceInfoDrawer";
import AddApplianceModal from "./AddApplianceModal";
import ConsumptionChart from "./ConsumptionChart";
import AIAdvisoryPanel from "./AIAdvisoryPanel";
import "./home-detail.css";

const POLL_MS = 2000;

export default function HomeDetailPage() {
  const { homeId } = useParams();
  const targetHomeId = homeId || "home-1";

  const navigate = useNavigate();
  const pushToast = useAppStore((s) => s.pushToast);

  const [home, setHome] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestingAdv, setRequestingAdv] = useState(false);
  const [viewMode, setViewMode] = useState("3d"); // "3d" or "floorplan"
  const [selectedFloor, setSelectedFloor] = useState("all");

  const fetchHome = useCallback(async (silent) => {
    try {
      const data = await api.getHomeDetail(targetHomeId);
      setHome(data);
      setLoadError("");
    } catch (err) {
      if (!silent) setLoadError(err instanceof ApiError ? err.message : "Konut yüklenemedi.");
    }
  }, [targetHomeId]);

  useEffect(() => {
    fetchHome(false);
    api.getHomeHistory(targetHomeId).then(setHistory).catch(() => {});
    const id = setInterval(() => fetchHome(true), POLL_MS);
    return () => clearInterval(id);
  }, [fetchHome, targetHomeId]);

  async function handleAddAppliance(payload) {
    setSubmitting(true);
    try {
      await api.addAppliance(targetHomeId, payload);
      await fetchHome(true);
      setModalOpen(false);
      pushToast(`${payload.name} eklendi.`, "success");
    } catch (err) {
      pushToast(err instanceof ApiError ? err.message : "Eşya eklenemedi.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAppliance(appliance) {
    const confirmed = window.confirm(`${appliance.name} (${appliance.room}) silinsin mi?`);
    if (!confirmed) return;
    try {
      await api.deleteAppliance(targetHomeId, appliance.id);
      await fetchHome(true);
      if (selectedGroup === appliance.name) setSelectedGroup(null);
      pushToast(`${appliance.name} silindi.`, "info");
    } catch (err) {
      pushToast(err instanceof ApiError ? err.message : "Eşya silindi.", "error");
    }
  }

  async function handleRequestAdvisory() {
    try {
      setRequestingAdv(true);
      await api.fetchAdvisory(targetHomeId);
      await fetchHome(true);
      pushToast("YENİ AI ÖNERİSİ OLUŞTURULDU", "success");
    } catch (err) {
      pushToast(err instanceof ApiError ? err.message : "Öneri oluşturulamadı.", "error");
    } finally {
      setRequestingAdv(false);
    }
  }

  if (loadError && !home) {
    return (
      <div className="home-detail-error">
        <p>{loadError}</p>
        <button className="btn-ghost" onClick={() => navigate("/dashboard")}>← Panele dön</button>
      </div>
    );
  }

  if (!home) {
    return <div className="home-detail-loading mono">Konut verisi yükleniyor…</div>;
  }

  const quotaPct = Math.min(100, Math.round((home.usedKwh / home.quotaKwh) * 100));
  const isPenalty = home.tariffState === "PENALTY" || quotaPct >= 100;
  const isWarning = home.tariffState === "WARNING" || (quotaPct >= 80 && !isPenalty);

  // Group appliances by room floor
  const roomsMap = {};
  if (home.appliances) {
    home.appliances.forEach((a) => {
      if (!roomsMap[a.room]) roomsMap[a.room] = [];
      roomsMap[a.room].push(a);
    });
  }

  return (
    <div className="home-detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb mono">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <span className="current-page">{home.name}</span>
      </div>

      {/* Header Bar */}
      <header className="home-detail-header">
        <button className="btn-ghost" onClick={() => navigate("/dashboard")}>← Panele dön</button>
        <div className="home-detail-title">
          <h1>{home.name}</h1>
          <span className="mono muted">{home.address} · {home.ownerName}</span>
        </div>

        {/* View Switcher: 3D Tek Ev Görünümü vs Oda Bazlı Tablo vs 3D Kat Planı */}
        <div className="view-mode-toggle glass-panel">
          <button
            type="button"
            className={`toggle-btn ${viewMode === "3d" ? "active" : ""}`}
            onClick={() => setViewMode("3d")}
          >
            3D Tek Ev Görünümü
          </button>
          <button
            type="button"
            className="toggle-btn"
            style={{ color: "var(--volt)", borderColor: "var(--volt)" }}
            onClick={() => navigate(`/house/${targetHomeId}`)}
          >
            🏢 3D Kat Planını Aç →
          </button>
          <button
            type="button"
            className={`toggle-btn ${viewMode === "floorplan" ? "active" : ""}`}
            onClick={() => setViewMode("floorplan")}
          >
            Oda Bazlı Tablo
          </button>
        </div>

        <span className={`tariff-pill ${isPenalty ? "danger" : isWarning ? "warning" : "normal"}`}>
          {isPenalty ? "Ceza Tarifesi" : isWarning ? "%80 Kota Uyarısı" : "Normal Tarife"}
        </span>
      </header>

      {/* Main Body */}
      <div className="home-detail-body">
        <div className="home-detail-viewer">
          {viewMode === "3d" ? (
            /* Single House 3D View (Clicking opens 3D floor plan) */
            <House3D
              homes={[home]}
              activeHomeId={home.id}
              appliances={home.appliances}
              onSelectHome={() => navigate(`/house/${targetHomeId}`)}
            />
          ) : (
            /* Interactive Oda Bazlı Tablo View */
            <div className="floorplan-view-container">
              <div className="floorplan-header">
                <div>
                  <h3>Kat & Oda Bazlı Tüketim Dağılımı</h3>
                  <p className="subtitle">Eve ve odalara tıklayarak anlık cihaz watt değerlerini ve tarife durumunu inceleyin.</p>
                </div>
                <div className="floor-filter-chips">
                  <button
                    type="button"
                    className={`floor-chip ${selectedFloor === "all" ? "active" : ""}`}
                    onClick={() => setSelectedFloor("all")}
                  >
                    Tüm Odalar ({Object.keys(roomsMap).length})
                  </button>
                  {Object.keys(roomsMap).map((room) => (
                    <button
                      key={room}
                      type="button"
                      className={`floor-chip ${selectedFloor === room ? "active" : ""}`}
                      onClick={() => setSelectedFloor(room)}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floor Plan Diagram Cards Grid */}
              <div className="floorplan-rooms-grid">
                {Object.entries(roomsMap)
                  .filter(([room]) => selectedFloor === "all" || selectedFloor === room)
                  .map(([room, apps]) => {
                    const roomKw = (apps.reduce((sum, a) => sum + a.currentWatt, 0) / 1000).toFixed(2);
                    const hasAnomaly = apps.some((a) => a.isAnomalous);

                    return (
                      <div
                        key={room}
                        className={`floorplan-room-card glass-panel ${hasAnomaly ? "has-anomaly" : ""}`}
                      >
                        <div className="room-card-head">
                          <span className="room-name">{room}</span>
                          <strong className="room-kw mono">{roomKw} kW</strong>
                        </div>

                        <div className="room-devices-list">
                          {apps.map((app) => (
                            <div
                              key={app.id}
                              className="room-device-item"
                              onClick={() => setSelectedGroup(app.name)}
                            >
                              <span className="name">{app.name}</span>
                              <span className="watt mono">{(app.currentWatt / 1000).toFixed(2)} kW</span>
                              {app.isAnomalous && <span className="anomaly-dot" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="home-detail-side">
          <ApplianceList
            appliances={home.appliances}
            onSelectAppliance={(a) => setSelectedGroup(a.name)}
            onDelete={handleDeleteAppliance}
            onAddClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Bottom Charts & Advisory */}
      <div className="home-detail-bottom">
        <motion.div
          className="glass-panel chart-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Günlük Tüketim Trendi</h3>
          <ConsumptionChart data={history} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleRequestAdvisory}
              disabled={requestingAdv}
            >
              {requestingAdv ? "Analiz Ediliyor..." : "✨ Yeni AI Önerisi İste"}
            </button>
          </div>
          <AIAdvisoryPanel advisories={home.advisories} contactEmail={home.contactEmail} />
        </motion.div>
      </div>

      <ApplianceInfoDrawer
        groupName={selectedGroup}
        appliances={home.appliances}
        onClose={() => setSelectedGroup(null)}
      />

      <AddApplianceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddAppliance}
        submitting={submitting}
      />
    </div>
  );
}
