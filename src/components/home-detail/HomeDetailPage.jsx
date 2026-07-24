import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const pushToast = useAppStore((s) => s.pushToast);

  const [home, setHome] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchHome = useCallback(async (silent) => {
    try {
      const data = await api.getHomeDetail(homeId);
      setHome(data);
      setLoadError("");
    } catch (err) {
      if (!silent) setLoadError(err instanceof ApiError ? err.message : "Konut yüklenemedi.");
    }
  }, [homeId]);

  useEffect(() => {
    fetchHome(false);
    api.getHomeHistory(homeId).then(setHistory).catch(() => {});
    const id = setInterval(() => fetchHome(true), POLL_MS);
    return () => clearInterval(id);
  }, [fetchHome, homeId]);

  async function handleAddAppliance(payload) {
    setSubmitting(true);
    try {
      await api.addAppliance(homeId, payload);
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
      await api.deleteAppliance(homeId, appliance.id);
      await fetchHome(true);
      if (selectedGroup === appliance.name) setSelectedGroup(null);
      pushToast(`${appliance.name} silindi.`, "info");
    } catch (err) {
      pushToast(err instanceof ApiError ? err.message : "Eşya silinemedi.", "error");
    }
  }

  if (loadError && !home) {
    return (
      <div className="home-detail-error">
        <p>{loadError}</p>
        <button className="btn-ghost" onClick={() => navigate("/dashboard")}>Panele dön</button>
      </div>
    );
  }

  if (!home) {
    return <div className="home-detail-loading mono">Konut verisi yükleniyor…</div>;
  }

  const isBreached = home.tariffState === "PENALTY";

  return (
    <div className="home-detail-page">
      <header className="home-detail-header">
        <button className="btn-ghost" onClick={() => navigate("/dashboard")}>← Panele dön</button>
        <div className="home-detail-title">
          <h1>{home.name}</h1>
          <span className="mono muted">{home.address} · {home.ownerName}</span>
        </div>
        <span className={`tariff-pill ${isBreached ? "danger" : "normal"}`}>
          {isBreached ? "Ceza Tarifesi" : "Normal Tarife"}
        </span>
      </header>

      <div className="home-detail-body">
        <div className="home-detail-viewer">
          <House3D appliances={home.appliances} onSelectAppliance={(a) => setSelectedGroup(a.name)} />
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
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
