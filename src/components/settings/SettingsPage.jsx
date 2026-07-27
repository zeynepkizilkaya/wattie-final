import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import "./settings.css";

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const accentColor = useAppStore((s) => s.accentColor);
  const setAccentColor = useAppStore((s) => s.setAccentColor);
  const pollInterval = useAppStore((s) => s.pollInterval);
  const setPollInterval = useAppStore((s) => s.setPollInterval);
  const notificationSettings = useAppStore((s) => s.notificationSettings);
  const updateNotificationSetting = useAppStore((s) => s.updateNotificationSetting);
  const animationsEnabled = useAppStore((s) => s.animationsEnabled);
  const toggleAnimations = useAppStore((s) => s.toggleAnimations);
  const logout = useAppStore((s) => s.logout);
  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "Zeynep");
  const [email, setEmail] = useState(user?.email || "demo@wattie.ai");

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUser({ name, email });
    setIsEditingProfile(false);
    pushToast("Profil bilgileriniz başarıyla güncellendi.", "success");
  };

  const handleResetAll = () => {
    if (window.confirm("Tüm yerel ayarlar ve oturum verileri sıfırlanacaktır. Emin misiniz?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    pushToast("Oturum kapatıldı.", "info");
    navigate("/");
  };

  return (
    <motion.div
      className="settings-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="settings-header">
        <h2>Sistem & Kullanıcı Ayarları</h2>
        <p className="subtitle">Profil bilgilerinizi, görünüm temalarını ve telemetri ayarlarınızı yapılandırın.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-panel settings-section">
        <div className="section-header">
          <h3>Kullanıcı Profili</h3>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="profile-edit-form">
            <div className="form-field">
              <label htmlFor="user-name">Ad Soyad</label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="user-email">E-Posta Adresi</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setIsEditingProfile(false)}>
                İptal
              </button>
              <button type="submit" className="btn-primary">
                Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-card">
            <div className="profile-avatar">
              {(user?.name || "Z")[0].toUpperCase()}
            </div>
            <div className="profile-details">
              <strong className="profile-name">{user?.name || "Zeynep"}</strong>
              <span className="profile-email">{user?.email || "demo@wattie.ai"}</span>
              <span className="profile-plan-badge">Premium Plan</span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsEditingProfile(true)}
            >
              Profili Düzenle
            </button>
          </div>
        )}
      </div>

      {/* Appearance Section */}
      <div className="glass-panel settings-section">
        <div className="section-header">
          <h3>Görünüm & Tema</h3>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Tema Tercihi</strong>
            <span>Koyu veya açık arayüz modunu seçin.</span>
          </div>
          <div className="btn-group">
            <button
              type="button"
              className={`group-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => theme !== "dark" && toggleTheme()}
            >
              Koyu Tema
            </button>
            <button
              type="button"
              className={`group-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => theme !== "light" && toggleTheme()}
            >
              Açık Tema
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Vurgu Rengi (Accent)</strong>
            <span>Grafik ve aktif bağlantı renk tonunu değiştirin.</span>
          </div>
          <div className="accent-swatches">
            {[
              { id: "purple", color: "#7c9eff", label: "Mor" },
              { id: "blue", color: "#3b82f6", label: "Mavi" },
              { id: "green", color: "#10b981", label: "Yeşil" },
              { id: "orange", color: "#f59e0b", label: "Turuncu" },
            ].map((swatch) => (
              <button
                key={swatch.id}
                type="button"
                className={`swatch-btn ${accentColor === swatch.id ? "active" : ""}`}
                style={{ background: swatch.color }}
                onClick={() => setAccentColor(swatch.id)}
                title={swatch.label}
              />
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Animasyonlar</strong>
            <span>Arayüz geçiş ve kart animasyonlarını yönetin.</span>
          </div>
          <button
            type="button"
            className={`toggle-btn ${animationsEnabled ? "active" : ""}`}
            onClick={toggleAnimations}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-panel settings-section">
        <div className="section-header">
          <h3>Bildirim Tercihleri</h3>
        </div>

        {[
          { key: "email", title: "E-posta Bildirimleri", desc: "Önemli uyarılarda e-posta ile bilgilendir." },
          { key: "quotaWarning", title: "Kota %80 Uyarısı", desc: "Bütçenin %80'ine ulaşıldığında uyarı ver." },
          { key: "quotaBreach", title: "Kota %100 Aşımı", desc: "Ceza tarifesine geçildiğinde bildirim at." },
          { key: "deviceAnomaly", title: "Cihaz Anomalileri", desc: "Yüksek watt çeken cihazlarda bildirim oluştur." },
          { key: "aiRecommendation", title: "AI Önerileri", desc: "Yeni yapay zeka tasarruf önerilerinde bildirim gönder." },
        ].map((item) => (
          <div key={item.key} className="settings-row">
            <div className="row-info">
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </div>
            <button
              type="button"
              className={`toggle-btn ${notificationSettings[item.key] ? "active" : ""}`}
              onClick={() => updateNotificationSetting(item.key, !notificationSettings[item.key])}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        ))}
      </div>

      {/* System Settings */}
      <div className="glass-panel settings-section">
        <div className="section-header">
          <h3>Telemetri & Sistem</h3>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Polling Frekansı</strong>
            <span>Canlı telemetri verilerinin güncellenme sıklığı.</span>
          </div>
          <div className="btn-group">
            {[1000, 2000, 5000, 10000].map((ms) => (
              <button
                key={ms}
                type="button"
                className={`group-btn ${pollInterval === ms ? "active" : ""}`}
                onClick={() => setPollInterval(ms)}
              >
                {ms / 1000}sn
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Veri Kaynağı Modu</strong>
            <span>Mock Veri Simülasyonu (Apache Ignite Ready)</span>
          </div>
          <span className="status-pill-sub mono">IN-MEMORY MOCK</span>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <strong>Sistem Versiyonu</strong>
            <span>Wattie Core v2.4.0 (Vite + React 19)</span>
          </div>
          <span className="status-pill-sub mono">STABLE</span>
        </div>

        <div className="settings-danger-actions">
          <button type="button" className="btn-ghost text-danger" onClick={handleResetAll}>
            Tüm Verileri Sıfırla
          </button>

          <button type="button" className="btn-primary" onClick={handleLogout}>
            Oturumu Kapat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
