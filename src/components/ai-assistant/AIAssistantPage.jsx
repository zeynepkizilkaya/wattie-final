import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, ApiError } from "../../lib/api";
import { mockAdvisoryHistory } from "../../lib/mockData";
import { useAppStore } from "../../store/useAppStore";
import SkeletonCard from "../shared/Skeleton";
import "./ai-assistant.css";

export default function AIAssistantPage() {
  const [advisories, setAdvisories] = useState([]);
  const [homes, setHomes] = useState([]);
  const [selectedHomeId, setSelectedHomeId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [requestingNew, setRequestingNew] = useState(false);

  const pushToast = useAppStore((s) => s.pushToast);

  const loadData = async () => {
    try {
      setLoading(true);
      const homesData = await api.getHomes();
      setHomes(homesData);

      const history = mockAdvisoryHistory();
      setAdvisories(history);
    } catch (err) {
      console.error("AI Önerileri alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestAdvisory = async () => {
    const targetHome = selectedHomeId === "all" ? homes[0] : homes.find((h) => h.id === selectedHomeId);
    if (!targetHome) {
      pushToast("Lütfen öneri istenecek bir konut seçin.", "warning");
      return;
    }

    try {
      setRequestingNew(true);
      const newAdv = await api.fetchAdvisory(targetHome.id);
      setAdvisories((prev) => [
        {
          ...newAdv,
          homeId: targetHome.id,
          homeName: targetHome.name,
        },
        ...prev,
      ]);
      pushToast(`"${targetHome.name}" için yeni AI otomasyon önerisi üretildi!`, "success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Öneri üretilirken hata oluştu.";
      pushToast(msg, "danger");
    } finally {
      setRequestingNew(false);
    }
  };

  const filteredAdvisories = advisories.filter((a) => {
    if (selectedHomeId === "all") return true;
    return a.homeId === selectedHomeId;
  });

  const getTriggerBadge = (type) => {
    if (type === "QUOTA_BREACH_100") {
      return <span className="trigger-badge danger">CEZA TARİFESİ (%100+)</span>;
    }
    if (type === "QUOTA_BREACH_80") {
      return <span className="trigger-badge warning">KOTA %80 UYARISI</span>;
    }
    if (type === "DEVICE_ANOMALY") {
      return <span className="trigger-badge anomaly">CİHAZ ANOMALİSİ</span>;
    }
    return <span className="trigger-badge info">OTOMASYON FIRSATI</span>;
  };

  return (
    <motion.div
      className="ai-assistant-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="ai-assistant-header">
        <div>
          <h2>Wattie AI Core — Enerji Otomasyon Asistanı</h2>
          <p className="subtitle">Yapay zeka analitik modelimizin konutlarınız için ürettiği anlık tasarruf, bütçe koruma ve otomasyon tavsiyeleri.</p>
        </div>

        <div className="ai-actions-bar">
          <div className="home-filter-dropdown glass-panel">
            <select
              value={selectedHomeId}
              onChange={(e) => setSelectedHomeId(e.target.value)}
            >
              <option value="all">Tüm Konutlar ({homes.length})</option>
              {homes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleRequestAdvisory}
            disabled={requestingNew}
          >
            {requestingNew ? "Yapay Zeka Analiz Ediyor..." : "Yeni AI Önerisi İste"}
          </button>
        </div>
      </div>

      {/* Advisories Feed */}
      {loading ? (
        <div className="advisories-feed">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="ai-empty-card glass-panel">
          <h3>Henüz Yapay Zeka Önerisi Yok</h3>
          <p>Seçilen konut için henüz otomatik öneri tetiklenmedi. Yeni bir analiz başlatabilirsiniz.</p>
          <button type="button" className="btn-primary" onClick={handleRequestAdvisory}>
            Şimdi Analiz Başlat
          </button>
        </div>
      ) : (
        <div className="advisories-feed">
          {filteredAdvisories.map((adv) => (
            <motion.div
              key={adv.id}
              className="glass-panel advisory-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-top-row">
                <div className="meta-left">
                  <span className="home-badge mono">{adv.homeName || "Akıllı Konut"}</span>
                  {getTriggerBadge(adv.triggeredBy)}
                </div>
                <span className="adv-date mono">
                  {new Date(adv.createdAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <h3 className="adv-subject">{adv.subject}</h3>
              <p className="adv-body">{adv.body}</p>

              <div className="adv-card-footer">
                <span className="ai-tag">Wattie AI Optimization Model v2.4</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
