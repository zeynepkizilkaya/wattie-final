import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { applianceCatalog } from "../../lib/mockData";

const ROOMS = ["Oturma Odası", "Mutfak", "Yatak Odası", "Banyo", "Çalışma Odası", "Balkon"];

export default function AddApplianceModal({ open, onClose, onSubmit, submitting }) {
  const [name, setName] = useState(applianceCatalog[0].type);
  const [room, setRoom] = useState(ROOMS[0]);
  const [safeWatt, setSafeWatt] = useState(150);

  function handleSubmit(e) {
    e.preventDefault();
    const catalogMatch = applianceCatalog.find((c) => c.type === name);
    onSubmit({ name, room, safeWatt, icon: catalogMatch?.icon || "plug" });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="modal glass-panel"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow mono">YENİ EŞYA</span>
                <h3>Eşya ekle</h3>
              </div>
              <button className="btn-icon" onClick={onClose} aria-label="Kapat">✕</button>
            </div>
            <p className="drawer-sub">Yeni eklenen eşyalar tüketim listesinde izlenir; 360° ev görünümüne dahil edilmez.</p>

            <form onSubmit={handleSubmit} className="modal-form">
              <label className="field">
                <span>Cihaz türü</span>
                <select value={name} onChange={(e) => setName(e.target.value)}>
                  {applianceCatalog.map((c) => (
                    <option key={c.type} value={c.type}>{c.type}</option>
                  ))}
                  <option value="Diğer">Diğer</option>
                </select>
              </label>
              <label className="field">
                <span>Oda</span>
                <select value={room} onChange={(e) => setRoom(e.target.value)}>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Güvenli tüketim sınırı (W)</span>
                <input
                  type="number"
                  min={10}
                  required
                  value={safeWatt}
                  onChange={(e) => setSafeWatt(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Ekleniyor…" : "Eşyayı kaydet"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
