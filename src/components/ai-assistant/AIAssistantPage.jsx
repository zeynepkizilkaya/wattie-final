import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { api } from "../../lib/api";

import { useAppStore } from "../../store/useAppStore";

import SkeletonCard from "../shared/Skeleton";

import "./ai-assistant.css";

export default function AIAssistantPage() {
  const [advisories, setAdvisories] = useState([]);
  const [homes, setHomes] = useState([]);
  const [selectedHomeId, setSelectedHomeId] = useState("all");
  const [loading, setLoading] = useState(true);

  const pushToast = useAppStore((s) => s.pushToast);

  const loadData = async () => {
    try {
      setLoading(true);

      const homesData = await api.getHomes();

      setHomes(homesData);

      const results = await Promise.all(
        homesData.map(async (home) => {
          try {
            const events = await api.getHomeEvents(String(home.id));

            if (!Array.isArray(events)) {
              return [];
            }

            return events
              .filter((event) => event.aiRecommendation)
              .map((event) => ({
                id: event.id,
                homeId: String(home.id),
                homeName: home.name,
                createdAt: event.createdAt,
                triggeredBy: event.eventType,
                subject:
                  event.eventType === "ANOMALY_DETECTED"
                    ? "Cihaz Anomalisi Tespit Edildi"
                    : event.eventType === "QUOTA_BREACH_80"
                      ? "Kota %80 Uyarısı"
                      : event.eventType === "QUOTA_BREACH_100"
                        ? "Kota %100 Aşımı"
                        : "Wattie AI Önerisi",
                body: event.aiRecommendation,
                details: event.details,
              }));
          } catch (error) {
            console.error(
              `Home ${home.id} eventleri alınamadı:`,
              error
            );

            return [];
          }
        })
      );

      const mergedAdvisories = results
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      setAdvisories(mergedAdvisories);
    } catch (error) {
      console.error("AI verileri alınamadı:", error);

      pushToast(
        "AI verileri alınırken bir hata oluştu.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredAdvisories = advisories.filter((advisory) => {
    if (selectedHomeId === "all") {
      return true;
    }

    return String(advisory.homeId) === String(selectedHomeId);
  });

  const getTriggerBadge = (type) => {
    if (type === "QUOTA_BREACH_100") {
      return (
        <span className="trigger-badge danger">
          CEZA TARİFESİ (%100+)
        </span>
      );
    }

    if (type === "QUOTA_BREACH_80") {
      return (
        <span className="trigger-badge warning">
          KOTA %80 UYARISI
        </span>
      );
    }

    if (type === "ANOMALY_DETECTED") {
      return (
        <span className="trigger-badge anomaly">
          CİHAZ ANOMALİSİ
        </span>
      );
    }

    return (
      <span className="trigger-badge info">
        AI ÖNERİSİ
      </span>
    );
  };

  return (
    <motion.div
      className="ai-assistant-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ai-assistant-header">
        <div>
          <h2>Wattie AI Core — Enerji Otomasyon Asistanı</h2>

          <p className="subtitle">
            Yapay zeka analitik modelimizin konutlarınız için
            ürettiği anlık tasarruf, bütçe koruma ve otomasyon
            tavsiyeleri.
          </p>
        </div>

        <div className="ai-actions-bar">
          <div className="home-filter-dropdown glass-panel">
            <select
              value={selectedHomeId}
              onChange={(e) => setSelectedHomeId(e.target.value)}
            >
              <option value="all">
                Tüm Konutlar ({homes.length})
              </option>

              {homes.map((home) => (
                <option
                  key={home.id}
                  value={String(home.id)}
                >
                  {home.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={loadData}
          >
            AI Verilerini Yenile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="advisories-feed">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="ai-empty-card glass-panel">
          <h3>Henüz Yapay Zeka Önerisi Yok</h3>

          <p>
            Seçilen konut için henüz AI önerisi oluşturulmamış.
            Cihaz anomalisi veya kota eşiği oluştuğunda öneriler
            burada görünecektir.
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={loadData}
          >
            Verileri Yenile
          </button>
        </div>
      ) : (
        <div className="advisories-feed">
          {filteredAdvisories.map((advisory) => (
            <motion.div
              key={advisory.id}
              className="glass-panel advisory-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-top-row">
                <div className="meta-left">
                  <span className="home-badge mono">
                    {advisory.homeName}
                  </span>

                  {getTriggerBadge(advisory.triggeredBy)}
                </div>

                <span className="adv-date mono">
                  {new Date(
                    advisory.createdAt
                  ).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <h3 className="adv-subject">
                {advisory.subject}
              </h3>

              <p className="adv-body">
                {advisory.body}
              </p>

              {advisory.details && (
                <p className="adv-details">
                  {advisory.details}
                </p>
              )}

              <div className="adv-card-footer">
                <span className="ai-tag">
                  Wattie AI Optimization Model
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}