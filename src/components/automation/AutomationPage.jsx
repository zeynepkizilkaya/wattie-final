import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "../../lib/api";
import { mockAutomationPerformance } from "../../lib/mockData";
import { useAppStore } from "../../store/useAppStore";
import SkeletonCard from "../shared/Skeleton";
import "./automation.css";

export default function AutomationPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("Zamanlama");
  const [savingEst, setSavingEst] = useState(65);
  const [submitting, setSubmitting] = useState(false);

  const pushToast = useAppStore((s) => s.pushToast);
  const performance = mockAutomationPerformance("home-1");

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await api.getAutomationRules("home-1");
      setRules(data);
    } catch (err) {
      console.error("Kurallar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggleRule = async (ruleId) => {
    try {
      const updated = await api.toggleAutomationRule("home-1", ruleId);
      setRules((prev) => prev.map((r) => (r.id === ruleId ? updated : r)));
      pushToast(`Kural durumu değiştirildi: ${updated.name}`, "info");
    } catch (err) {
      pushToast("Kural durumu değiştirilemedi.", "danger");
    }
  };

  const handleDeleteRule = async (ruleId, name) => {
    if (!window.confirm(`"${name}" otomasyon kuralını silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteAutomationRule("home-1", ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      pushToast(`Kural silindi: ${name}`, "info");
    } catch (err) {
      pushToast("Kural silinemedi.", "danger");
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleName || !description) {
      pushToast("Lütfen kural adı ve açıklamasını doldurun.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.createAutomationRule("home-1", {
        name: ruleName,
        description,
        trigger: triggerType,
        targetDeviceCount: 2,
        estimatedSaving: Number(savingEst),
      });

      setRules((prev) => [created, ...prev]);
      pushToast(`"${created.name}" kuralı başarıyla eklendi!`, "success");
      setIsModalOpen(false);
      setRuleName("");
      setDescription("");
    } catch (err) {
      pushToast("Kural oluşturulurken hata oluştu.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="automation-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="automation-header">
        <div>
          <h2>Akıllı Enerji Otomasyon Kuralları</h2>
          <p className="subtitle">Kural tabanlı cihaz yönetimi ile pik saatlerde otomatik tasarruf senaryoları uygulayın.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Yeni Kural Oluştur
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="rules-list">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : rules.length === 0 ? (
        <div className="empty-rules glass-panel">
          <span>Henüz aktif bir otomasyon kuralı tanımlanmadı.</span>
        </div>
      ) : (
        <div className="rules-list">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-panel rule-card">
              <div className="rule-left">
                <div className="rule-info">
                  <div className="rule-title-row">
                    <h3>{rule.name}</h3>
                    <span className={`status-badge ${rule.status}`}>
                      {rule.status === "active" ? "Aktif" : "Duraklatıldı"}
                    </span>
                  </div>
                  <p className="rule-desc">{rule.description}</p>

                  <div className="rule-meta-row">
                    <span>Tetikleyici: <strong>{rule.trigger}</strong></span>
                    <span>Cihazlar: <strong>{rule.targetDeviceCount} Adet</strong></span>
                    <span>Tahmini Tasarruf: <strong className="mono text-current">₺{rule.estimatedSaving}/ay</strong></span>
                  </div>
                </div>
              </div>

              <div className="rule-actions">
                <button
                  type="button"
                  className={`toggle-btn ${rule.status === "active" ? "active" : ""}`}
                  onClick={() => handleToggleRule(rule.id)}
                  title="Durumu Değiştir"
                >
                  <span className="toggle-thumb" />
                </button>

                <button
                  type="button"
                  className="delete-rule-btn"
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  title="Sil"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Section */}
      <div className="glass-panel performance-panel">
        <div className="panel-header">
          <h3>Otomasyon Performansı & Aylık Tasarruf</h3>
          <span className="mono subtitle">Bu Ay Toplam: ₺{performance.monthlySaving} Tasarruf</span>
        </div>

        <div className="performance-content">
          <div className="perf-kpi-column">
            <div className="perf-kpi-box">
              <span>Aktif Çalışan Kurallar</span>
              <strong className="mono">{performance.activeRules} Kural</strong>
            </div>
            <div className="perf-kpi-box">
              <span>Engellenen Kota Aşımı</span>
              <strong className="mono text-success">{performance.blockedBreaches} Olay</strong>
            </div>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performance.trend}>
                <XAxis dataKey="month" stroke="var(--text-3)" fontSize={11} />
                <YAxis stroke="var(--text-3)" fontSize={11} unit=" ₺" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 15, 25, 0.94)",
                    borderColor: "var(--panel-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="saving" name="Tasarruf (₺)" fill="var(--current)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Create New Rule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <motion.div
              className="modal-card glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>+ Yeni Otomasyon Kuralı Oluştur</h3>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateRule} className="rule-form">
                <div className="form-field">
                  <label htmlFor="rule-name">Kural Adı *</label>
                  <input
                    id="rule-name"
                    type="text"
                    placeholder="Örn: Gece Tarifesi Optimizasyonu"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="rule-desc">Açıklama *</label>
                  <textarea
                    id="rule-desc"
                    placeholder="Kuralın ne yaptığını açıklayın..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="trigger-type">Tetikleyici Türü</label>
                    <select
                      id="trigger-type"
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                    >
                      <option value="Zamanlama">Zamanlama (Saat Aralığı)</option>
                      <option value="Sıcaklık Eşiği">Sıcaklık Eşiği (°C)</option>
                      <option value="Kota Eşiği">Kota Eşiği (%)</option>
                      <option value="Cihaz Anomalisi">Cihaz Anomalisi</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="saving-est">Tahmini Aylık Tasarruf (₺)</label>
                    <input
                      id="saving-est"
                      type="number"
                      value={savingEst}
                      onChange={(e) => setSavingEst(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Kaydediliyor..." : "Kuralı Kaydet →"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
