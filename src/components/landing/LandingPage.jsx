import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartHouseScene from "./SmartHouseScene";
import LoginPanel from "./LoginPanel";
import LightningStrike from "./LightningStrike";
import "./landing.css";

export default function LandingPage() {
  const [isHouseHovered, setIsHouseHovered] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [strikeKey, setStrikeKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIntroReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleLightningTrigger = () => {
    setStrikeKey((prev) => prev + 1);
  };

  return (
    <div className="landing-page">
      {/* Smooth Black Screen Fade-out */}
      <AnimatePresence>
        {!introReady && (
          <motion.div
            className="intro-black-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* SVG Lightning Strike Arc Overlay */}
      <LightningStrike strikeKey={strikeKey} />

      {/* 3D Smart City & Atmosphere Scene */}
      <SmartHouseScene
        isHovered={isHouseHovered}
        onHoverChange={setIsHouseHovered}
        onLightningStrike={handleLightningTrigger}
      />

      {/* Ambient Bottom Gradient Overlay */}
      <div className="landing-atmosphere-overlay" />

      {/* Main Content Layout — Horizontal UX-Friendly Bottom Banner & Floating Electric Login Card */}
      <div className="landing-content-container">
        {/* Left/Bottom Side: Branding, Site Description, Horizontal Features & Developer Credits */}
        <section className="landing-hero">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: introReady ? 1 : 0, y: introReady ? 0 : 25 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          >
            <div className="brand-header-row">
              <div className="brand-badge">
                <span className="brand-dot energy-pulse" />
                <span className="eyebrow mono">⚡ WATTIE · AI POWERED SMART HOME ENERGY</span>
              </div>

              <h1 className="brand-title">WATTIE</h1>
              <p className="brand-tagline">
                Yapay Zeka Destekli Akıllı Konut Enerji Analitik Platformu
              </p>

              {/* Siteyi Anlatan Açıklama Yazısı */}
              <p className="brand-description-text">
                Wattie, konutlarınızdaki tüm IoT ve elektrikli cihazların anlık enerji tüketimini izler,
                bütçe ve kota aşımlarını önceden tahmin eder. Yapay zeka destekli otomasyon önerileri
                ile tasarruf yapmanızı ve akıllı evinizin kontrolünü elinizde tutmanızı sağlar.
              </p>
            </div>

            {/* Yatay UX Uyumlu Özellik Şeridi */}
            <div className="feature-row-horizontal">
              <div className="feature-pill">
                <span className="pill-icon">⚡</span>
                <div className="pill-text">
                  <strong>Real-Time Monitoring</strong>
                  <span>1-2sn canlı veri akışı</span>
                </div>
              </div>

              <div className="feature-pill">
                <span className="pill-icon">🧠</span>
                <div className="pill-text">
                  <strong>AI Recommendations</strong>
                  <span>Kişisel tasarruf modeli</span>
                </div>
              </div>

              <div className="feature-pill">
                <span className="pill-icon">🔌</span>
                <div className="pill-text">
                  <strong>IoT Management</strong>
                  <span>Cihaz bazlı analiz</span>
                </div>
              </div>

              <div className="feature-pill">
                <span className="pill-icon">📊</span>
                <div className="pill-text">
                  <strong>Energy Analytics</strong>
                  <span>Kota ve maliyet tahmini</span>
                </div>
              </div>
            </div>

            {/* Geliştirici Ekip & LinkedIn Yer Tutucu Alanı */}
            <div className="dev-team-credits">
              <span className="credits-label mono">Geliştirici Ekip:</span>
              <div className="dev-members-list">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="dev-member-chip"
                  title="LinkedIn Profilini Görüntüle"
                >
                  <span className="linkedin-icon">in</span>
                  <span>Geliştirici Adı 1</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="dev-member-chip"
                  title="LinkedIn Profilini Görüntüle"
                >
                  <span className="linkedin-icon">in</span>
                  <span>Geliştirici Adı 2</span>
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Right Side: Glassmorphism Electric Login Card */}
        <section className="landing-login">
          <LoginPanel />
        </section>
      </div>
    </div>
  );
}
