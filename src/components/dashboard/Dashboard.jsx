import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api, ApiError } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";
import HomeCard from "./HomeCard";
import { SkeletonCard } from "../shared/Skeleton";
import "./dashboard.css";

const POLL_MS = 1800;

export default function Dashboard() {
  const [homes, setHomes] = useState(null);
  const [errorBanner, setErrorBanner] = useState("");
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);
  const pushToast = useAppStore((s) => s.pushToast);

  const fetchHomes = useCallback(async (silent) => {
    try {
      const data = await api.getHomes();
      setHomes(data);
      setErrorBanner("");
    } catch (err) {
      if (!silent) {
        setErrorBanner(err instanceof ApiError ? err.message : "Konutlar yüklenemedi.");
      }
    }
  }, []);

  useEffect(() => {
    fetchHomes(false);
    const id = setInterval(() => fetchHomes(true), POLL_MS);
    return () => clearInterval(id);
  }, [fetchHomes]);

  const breachedCount = homes?.filter((h) => h.tariffState === "PENALTY").length ?? 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header circuit-bg">
        <div>
          <span className="eyebrow mono">WATTIE // KONTROL PANELİ</span>
          <h1>Kayıtlı Konutlar</h1>
        </div>
        <div className="dashboard-header-actions">
          {homes && (
            <span className="live-pill mono">
              <i className="live-dot" /> canlı · {homes.length} konut
              {breachedCount > 0 && <span className="live-pill-danger"> · {breachedCount} kota aşımı</span>}
            </span>
          )}
          <button
            className="btn-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Çıkış yap
          </button>
        </div>
      </header>

      {errorBanner && (
        <motion.div className="error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {errorBanner}
        </motion.div>
      )}

      <div className="home-grid">
        {!homes &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {homes &&
          homes.map((home, i) => (
            <HomeCard key={home.id} home={home} index={i} onOpen={(id) => navigate(`/home/${id}`)} />
          ))}
      </div>
    </div>
  );
}
