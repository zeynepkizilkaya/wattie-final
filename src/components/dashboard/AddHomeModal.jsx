import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";

export default function AddHomeModal({ open, onClose, onHomeAdded }) {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [quotaKwh, setQuotaKwh] = useState("400");
  const [quotaTry, setQuotaTry] = useState("2400");
  const [submitting, setSubmitting] = useState(false);

  const pushToast = useAppStore((s) => s.pushToast);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newHome = await api.registerHome({
        name,
        ownerName,
        address,
        contactEmail,
        quotaKwh: Number(quotaKwh),
        quotaTry: Number(quotaTry),
      });
      pushToast(`${newHome.name} başarıyla eklendi!`, "success");
      onHomeAdded?.(newHome);
      // Reset form fields
      setName("");
      setOwnerName("");
      setAddress("");
      setContactEmail("");
      setQuotaKwh("400");
      setQuotaTry("2400");
      onClose();
    } catch (err) {
      pushToast(err instanceof ApiError ? err.message : "Konut eklenemedi.", "danger");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-content glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>🏡 Yeni Konut Kaydı</h2>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Konut Adı</label>
              <input
                type="text"
                placeholder="Örn: Dağ Evi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Ev Sahibi</label>
              <input
                type="text"
                placeholder="Örn: Zeynep Yılmaz"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Adres / Şehir</label>
              <input
                type="text"
                placeholder="Örn: Bodrum, Muğla"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>İletişim E-posta</label>
              <input
                type="email"
                placeholder="zeynep@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Aylık Kota (kWh)</label>
                <input
                  type="number"
                  value={quotaKwh}
                  onChange={(e) => setQuotaKwh(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Bütçe Kotası (₺)</label>
                <input
                  type="number"
                  value={quotaTry}
                  onChange={(e) => setQuotaTry(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>İptal</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Kaydediliyor..." : "Konut Ekle"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
